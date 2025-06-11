import { ShielderTransaction } from '@cardinal-cryptography/shielder-sdk';
import { openDB, IDBPDatabase } from 'idb';
import { Address, sha256, isAddress } from 'viem';
import { z } from 'zod';

import isPresent from 'src/domains/misc/utils/isPresent';

const DB_NAME = 'SHIELDER_STORAGE';
const DB_VERSION = 4;

const STORE_CLIENTS = 'clients';
const STORE_TRANSACTIONS = 'transactions';

const ethAddress = z.custom<`0x${string}`>(
  val => typeof val === 'string' ? isAddress(val, { strict: true }) : false,
  val => ({ message: `Invalid Ethereum address: "${val}".` }),
);

const txHash = z.custom<`0x${string}`>(
  val => typeof val === 'string' && val.startsWith('0x'),
  val => ({ message: `Invalid transaction hash: "${val}".` }),
);

type ShielderClientData = Record<string, Record<string, string>>;
export type Fee = { amount: bigint, address: Address | 'native' };

export type LocalShielderActivityHistory = ShielderTransaction & {
  localId: string,
  status: 'pending' | 'completed' | 'failed',
  submitTimestamp?: number,
  completedTimestamp?: number,
  fee: Fee,
};

export type PartialLocalShielderActivityHistory =
  | (Partial<LocalShielderActivityHistory> & { localId: string, txHash?: `0x${string}` })
  | (Partial<LocalShielderActivityHistory> & { txHash: `0x${string}`, localId?: string });

export type LocalShielderActivityHistoryArray = PartialLocalShielderActivityHistory[];

type StoredLocalShielderActivityHistory = ReturnType<typeof toActivityHistoryStorageFormat>;
type LocalShielderActivityHistoryByChain = Partial<Record<string, StoredLocalShielderActivityHistory>>;

const shielderTransactionSchema = z.object({
  type: z.enum(['NewAccount', 'Deposit', 'Withdraw']),
  amount: z.bigint(),
  to: ethAddress.optional(),
  relayerFee: z.bigint().optional(),
  txHash,
  block: z.bigint(),
  token: z.union([
    z.object({ type: z.literal('native'), address: z.undefined().optional() }).passthrough(),
    z.object({ type: z.literal('erc20'), address: ethAddress }).passthrough(),
  ]).optional(),
  pocketMoney: z.bigint().optional(),
});

const localShielderActivityHistorySchema = shielderTransactionSchema.extend({
  localId: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  submitTimestamp: z.number().optional(),
  completedTimestamp: z.number().optional(),
  fee: z.object({
    amount: z.bigint(),
    address: z.union([ethAddress, z.literal('native')]),
  }).optional(),
});

const partialLocalShielderActivityHistorySchema = localShielderActivityHistorySchema.partial();

const toActivityHistoryStorageFormat = (activities: LocalShielderActivityHistoryArray) =>
  activities.map(a => ({
    ...a,
    amount: a.amount?.toString(),
    block: a.block?.toString(),
    relayerFee: a.relayerFee?.toString(),
    pocketMoney: a.pocketMoney?.toString(),
    fee: a.fee ? { ...a.fee, amount: a.fee.amount.toString() } : undefined,
  }));

const fromActivityHistoryStorageFormat = (data: unknown): LocalShielderActivityHistoryArray => {
  const parsed = z
    .array(
      partialLocalShielderActivityHistorySchema.extend({
        localId: z.string().optional(),
        amount: z.string().transform(BigInt).optional(),
        block: z.string().transform(BigInt).optional(),
        relayerFee: z.string().transform(BigInt).optional(),
        pocketMoney: z.string().transform(BigInt).optional(),
        fee: z.object({
          amount: z.string().transform(BigInt),
          address: z.union([
            ethAddress,
            z.literal('native'),
          ]),
        }).optional(),
        to: ethAddress.optional(),
        txHash: txHash.optional(),
      }),
    )
    .parse(data);

  return parsed.filter(item => item.localId ?? item.txHash) as LocalShielderActivityHistoryArray;
};

type DBSchema = {
  [STORE_CLIENTS]: { key: string, value: ShielderClientData },
  [STORE_TRANSACTIONS]: { key: string, value: LocalShielderActivityHistoryByChain },
};

const createDB = (): Promise<IDBPDatabase<DBSchema>> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade: db => {
      if (db.objectStoreNames.contains(STORE_CLIENTS)) {
        db.deleteObjectStore(STORE_CLIENTS);
      }
      if (db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.deleteObjectStore(STORE_TRANSACTIONS);
      }

      db.createObjectStore(STORE_CLIENTS);
      db.createObjectStore(STORE_TRANSACTIONS);
    },
  });
};

const dbp = createDB();

export const getShielderIndexedDB = (chainId: number, privateKey: Address) => {
  const chainKey = chainId.toString();
  const hashedKey = sha256(privateKey);

  return {
    getItem: async (itemKey: string): Promise<string | null> => {
      const db = await dbp;
      const addrData = await db.get(STORE_CLIENTS, hashedKey);
      return addrData?.[chainKey]?.[itemKey] ?? null;
    },
    setItem: async (itemKey: string, value: string): Promise<void> => {
      const db = await dbp;
      const addrData = (await db.get(STORE_CLIENTS, hashedKey)) ?? {};
      const chainData = addrData[chainKey] ?? {};
      await db.put(
        STORE_CLIENTS,
        { ...addrData, [chainKey]: { ...chainData, [itemKey]: value }},
        hashedKey,
      );
    },
  };
};

export const getLocalShielderActivityHistoryIndexedDB = (accountAddress: string) => {
  return {
    getItems: async (chainId: number) => {
      const db = await dbp;
      const allChains = await db.get(STORE_TRANSACTIONS, accountAddress);
      const raw = allChains?.[chainId.toString()];
      return raw ? fromActivityHistoryStorageFormat(raw) : null;
    },
    upsertItem: async (chainId: number, activity: PartialLocalShielderActivityHistory) => {
      const db = await dbp;
      const chainKey = chainId.toString();
      const allChains = (await db.get(STORE_TRANSACTIONS, accountAddress)) ?? {};
      const existingRaw = allChains[chainKey];
      const existing = existingRaw ? fromActivityHistoryStorageFormat(existingRaw) : [];

      // Same transaction can exist in different states: initially with localId only (pending),
      // later with txHash when confirmed on blockchain
      const isSame = (a: PartialLocalShielderActivityHistory, b: PartialLocalShielderActivityHistory) =>
        (isPresent(a.localId) && a.localId === b.localId) ||
        (isPresent(a.txHash) && a.txHash === b.txHash);

      // We might have multiple matches for the same transaction:
      // 1. Entry with localId but no txHash (created when transaction submitted)
      // 2. Entry with txHash (created when transaction detected on-chain)
      const matches = existing.filter(item => isSame(item, activity));
      const rest = existing.filter(item => !isSame(item, activity));

      // Separate: localOnly (user context) vs withTxHash (blockchain data)
      const localOnly = matches.find(i => isPresent(i.localId) && !isPresent(i.txHash)) ?? {};
      const withTxHash = matches.find(i => isPresent(i.txHash)) ?? {};

      // Merge in order: local data → blockchain data → new activity data
      const merged = {
        ...localOnly,
        ...withTxHash,
        ...activity,
      };

      const updated: LocalShielderActivityHistoryArray = [...rest, merged];

      await db.put(
        STORE_TRANSACTIONS,
        { ...allChains, [chainKey]: toActivityHistoryStorageFormat(updated) },
        accountAddress,
      );

      return merged;
    },
  };
};

export const clearShielderIndexedDB = async (): Promise<void> => {
  const db = await dbp;
  await Promise.all([db.clear(STORE_CLIENTS), db.clear(STORE_TRANSACTIONS)]);
};
