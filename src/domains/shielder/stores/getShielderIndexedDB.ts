import { ShielderTransaction } from '@cardinal-cryptography/shielder-sdk';
import { openDB, IDBPDatabase } from 'idb';
import { Address, sha256 } from 'viem';
import { z } from 'zod';

const DB_NAME = 'SHIELDER_STORAGE';
const DB_VERSION = 4;

const STORE_CLIENTS = 'clients';
const STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY = 'localShielderActivityHistory';

type ShielderClientData = Record<string, Record<string, string>>;

export type LocalShielderActivityHistory = ShielderTransaction & {
  localId: string,
  status: 'pending' | 'completed' | 'failed',
  submitTimestamp?: number,
  completedTimestamp?: number,
  fees?: Record<string, bigint>,
};

export type PartialLocalShielderActivityHistory =
  | (Partial<LocalShielderActivityHistory> & { localId: string })
  | (Partial<LocalShielderActivityHistory> & { txHash: `0x${string}` });

export type LocalShielderActivityHistoryArray = PartialLocalShielderActivityHistory[];

type StoredLocalShielderActivityHistory = ReturnType<typeof toActivityHistoryStorageFormat>;
type LocalShielderActivityHistoryByChain = Partial<Record<string, StoredLocalShielderActivityHistory>>;

const shielderTransactionSchema = z.object({
  type: z.enum(['NewAccount', 'Deposit', 'Withdraw']),
  amount: z.bigint(),
  to: z.string().transform(v => v as `0x${string}`).optional(),
  relayerFee: z.bigint().optional(),
  txHash: z.string().transform(v => v as `0x${string}`),
  block: z.bigint(),
  token: z.object({ type: z.string(), address: z.string().optional() }).passthrough(),
  pocketMoney: z.bigint().optional(),
});

const localShielderActivityHistorySchema = shielderTransactionSchema.extend({
  localId: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  submitTimestamp: z.number().optional(),
  completedTimestamp: z.number().optional(),
  fees: z.record(z.string(), z.bigint()).optional(),
});

const partialLocalShielderActivityHistorySchema = localShielderActivityHistorySchema.partial();

const toActivityHistoryStorageFormat = (activities: LocalShielderActivityHistoryArray) =>
  activities.map(a => ({
    ...a,
    amount: a.amount?.toString(),
    block: a.block?.toString(),
    relayerFee: a.relayerFee?.toString(),
    pocketMoney: a.pocketMoney?.toString(),
    fees: a.fees ? Object.fromEntries(Object.entries(a.fees).map(([k, v]) => [k, v.toString()])) : undefined,
  }));

const fromActivityHistoryStorageFormat = (data: unknown): LocalShielderActivityHistoryArray =>
  z
    .array(
      partialLocalShielderActivityHistorySchema.extend({
        amount: z.string().transform(BigInt).optional(),
        block: z.string().transform(BigInt).optional(),
        relayerFee: z.string().transform(BigInt).optional(),
        pocketMoney: z.string().transform(BigInt).optional(),
        fees: z.record(z.string(), z.string().transform(BigInt)).optional(),
        to: z.string().transform(v => v as `0x${string}`).optional(),
        txHash: z.string().transform(v => v as `0x${string}`).optional(),
      }),
    )
    .parse(data) as LocalShielderActivityHistoryArray;

type DBSchema = {
  [STORE_CLIENTS]: { key: string, value: ShielderClientData },
  [STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY]: { key: string, value: LocalShielderActivityHistoryByChain },
};

const initDB = async (): Promise<IDBPDatabase<DBSchema>> =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade: db => {
      if (!db.objectStoreNames.contains(STORE_CLIENTS)) db.createObjectStore(STORE_CLIENTS);
      if (!db.objectStoreNames.contains(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY)) {
        db.createObjectStore(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY);
      }
    },
  });

const mergeFirstDefined = <T extends Record<string, unknown>>(
  ...sources: readonly Partial<T>[]
): T => {
  const out: Partial<T> = {};
  sources.forEach(src =>
    void (Object.keys(src) as (keyof T)[]).forEach(k => {
      if (src[k] !== undefined && out[k] === undefined) out[k] = src[k];
    }),
  );
  return out as T;
};

const isDuplicate = (
  a: PartialLocalShielderActivityHistory,
  b: PartialLocalShielderActivityHistory,
) =>
  (a.localId !== undefined && a.localId === b.localId) ||
  (a.txHash !== undefined && a.txHash === b.txHash);

const hashFirst = (item: PartialLocalShielderActivityHistory) => (item.txHash ? 0 : 1);

export const getShielderIndexedDB = (chainId: number, privateKey: Address) => {
  const chainKey = chainId.toString();
  const hashedKey = sha256(privateKey);
  const dbp = initDB();

  return {
    getItem: async (itemKey: string) => {
      const db = await dbp;
      const addrData = await db.get(STORE_CLIENTS, hashedKey);
      return addrData?.[chainKey]?.[itemKey] ?? null;
    },
    setItem: async (itemKey: string, value: string) => {
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
  const dbp = initDB();

  return {
    getItems: async (chainId: number) => {
      const db = await dbp;
      const allChains = await db.get(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY, accountAddress);
      const raw = allChains?.[chainId.toString()];
      return raw ? fromActivityHistoryStorageFormat(raw) : null;
    },

    upsertItem: async (chainId: number, activity: PartialLocalShielderActivityHistory) => {
      const db = await dbp;
      const chainKey = chainId.toString();
      const allChains = (await db.get(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY, accountAddress)) ?? {};
      const existingRaw = allChains[chainKey];
      const existing = existingRaw ? fromActivityHistoryStorageFormat(existingRaw) : [];

      const [dups, rest] = existing.reduce<
        [LocalShielderActivityHistoryArray, LocalShielderActivityHistoryArray]
      >(
        ([d, r], cur) => (isDuplicate(cur, activity) ? [[...d, cur], r] : [d, [...r, cur]]),
        [[], []],
      );

      // eslint-disable-next-line no-restricted-syntax
      const sources = [...dups, activity].sort((a, b) => hashFirst(a) - hashFirst(b));
      const merged = mergeFirstDefined<PartialLocalShielderActivityHistory>(...sources);

      const updated: LocalShielderActivityHistoryArray = [...rest, merged];

      await db.put(
        STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY,
        { ...allChains, [chainKey]: toActivityHistoryStorageFormat(updated) },
        accountAddress,
      );
    },
  };
};

export const clearShielderIndexedDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION);
  await Promise.all([db.clear(STORE_CLIENTS), db.clear(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY)]);
};
