import { ShielderTransaction } from '@cardinal-cryptography/shielder-sdk';
import { openDB, deleteDB, IDBPDatabase } from 'idb';
import { Address, isAddress, sha256 } from 'viem';
import { z } from 'zod';

import isPresent from 'src/domains/misc/utils/isPresent';

const DB_INDEX = 3;
const DB_BASE_NAME = 'SHIELDER_STORAGE';
const DB_NAME = `${DB_BASE_NAME}_V${DB_INDEX}`;

const STORE_SHIELDER = 'shielder-store';
const STORE_TRANSACTIONS = 'shielder-transactions';

const ethAddress = z.custom<`0x${string}`>(
  val => typeof val === 'string' ? isAddress(val, { strict: true }) : false,
  val => ({ message: `Invalid Ethereum address: "${val}".` }),
);

const txHash = z.string().refine(
  (hash): hash is `0x${string}` => /^0x[a-fA-F0-9]{64}$/.test(hash),
  { message: 'Must be a valid transaction hash' }
);

type ShielderClientData = Record<string, Record<string, string>>;

export type LocalShielderActivityHistory = ShielderTransaction & {
  localId: string,
  status: 'pending' | 'completed' | 'failed',
  submitTimestamp?: number,
  completedTimestamp?: number,
};

export type PartialLocalShielderActivityHistory =
  | (Partial<LocalShielderActivityHistory> & {
    localId: string,
    txHash?: `0x${string}`,
  })
  | (Partial<LocalShielderActivityHistory> & {
    txHash: `0x${string}`,
    localId?: string,
  });

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
});

const partialLocalShielderActivityHistorySchema = localShielderActivityHistorySchema.partial();

const toActivityHistoryStorageFormat = (activities: LocalShielderActivityHistoryArray) =>
  activities.map(a => ({
    ...a,
    amount: a.amount?.toString(),
    block: a.block?.toString(),
    relayerFee: a.relayerFee?.toString(),
    pocketMoney: a.pocketMoney?.toString(),
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
        to: ethAddress.optional(),
        txHash: txHash.optional(),
      }),
    )
    .parse(data);

  return parsed.filter(item => item.localId ?? item.txHash) as LocalShielderActivityHistoryArray;
};

type DBSchema = {
  [STORE_SHIELDER]: { key: string, value: ShielderClientData },
  [STORE_TRANSACTIONS]: { key: string, value: LocalShielderActivityHistoryByChain },
};

// Clean up old database versions
const cleanupOldVersions = async (): Promise<void> => {
  const databases = await indexedDB.databases();
  const toDelete = databases
    .filter(db => db.name?.includes(DB_BASE_NAME) && db.name !== DB_NAME)
    .map(db => db.name)
    .filter((name): name is string => Boolean(name));

  await Promise.allSettled(toDelete.map(dbName => deleteDB(dbName)));
};

const createDB = async (): Promise<IDBPDatabase<DBSchema>> => {
  await cleanupOldVersions();

  // Always create version 1 since each DB_VERSION gets its own database
  return openDB<DBSchema>(DB_NAME, 1, {
    upgrade: db => {
      db.createObjectStore(STORE_SHIELDER);
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
      const addrData = await db.get(STORE_SHIELDER, hashedKey);
      return addrData?.[chainKey]?.[itemKey] ?? null;
    },
    setItem: async (itemKey: string, value: string): Promise<void> => {
      const db = await dbp;
      const addrData = (await db.get(STORE_SHIELDER, hashedKey)) ?? {};
      const chainData = addrData[chainKey] ?? {};
      await db.put(
        STORE_SHIELDER,
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
      const merged = { ...localOnly, ...withTxHash, ...activity };
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
  await Promise.all([db.clear(STORE_SHIELDER), db.clear(STORE_TRANSACTIONS)]);
};
