import { ShielderTransaction } from '@cardinal-cryptography/shielder-sdk';
import { openDB, IDBPDatabase } from 'idb';
import { Address, sha256 } from 'viem';
import { z } from 'zod';

import isPresent from 'src/domains/misc/utils/isPresent';

const DB_NAME = 'SHIELDER_STORAGE';
const DB_VERSION = 4;

const STORE_CLIENTS = 'clients';
const STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY = 'localShielderActivityHistory';

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
  | (Partial<LocalShielderActivityHistory> & { txHash: `0x${string}`, localId?: string })
  | (Partial<LocalShielderActivityHistory> & { localId: string, txHash: `0x${string}` });

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
  fee: z.object({ amount: z.bigint(), address: z.string() }).optional(),
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

const fromActivityHistoryStorageFormat = (data: unknown): LocalShielderActivityHistoryArray =>
  z
    .array(
      partialLocalShielderActivityHistorySchema.extend({
        amount: z.string().transform(BigInt).optional(),
        block: z.string().transform(BigInt).optional(),
        relayerFee: z.string().transform(BigInt).optional(),
        pocketMoney: z.string().transform(BigInt).optional(),
        fee: z.object({ amount: z.string().transform(BigInt), address: z.string() }).optional(),
        to: z.string().transform(v => v as `0x${string}`).optional(),
        txHash: z.string().transform(v => v as `0x${string}`).optional(),
      }),
    )
    .parse(data) as LocalShielderActivityHistoryArray;

type DBSchema = {
  [STORE_CLIENTS]: { key: string, value: ShielderClientData },
  [STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY]: { key: string, value: LocalShielderActivityHistoryByChain },
};

const deleteDatabase = (): Promise<void> => {
  const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

  return new Promise<void>((resolve, reject) => {
    deleteRequest.onsuccess = () => void resolve();
    deleteRequest.onerror = () => void reject(new Error(deleteRequest.error?.message ?? 'Database deletion failed'));
    deleteRequest.onblocked = () => void reject(new Error('Database deletion blocked. Please close other tabs using this application.'));
  });
};

const createDB = (): Promise<IDBPDatabase<DBSchema>> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade: db => {
      if (db.objectStoreNames.contains(STORE_CLIENTS)) {
        db.deleteObjectStore(STORE_CLIENTS);
      }
      if (db.objectStoreNames.contains(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY)) {
        db.deleteObjectStore(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY);
      }

      db.createObjectStore(STORE_CLIENTS);
      db.createObjectStore(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY);
    },
  });
};

// Database instance management using a closure to avoid mutations
const createDBManager = () => {
  const cache = new Map<string, Promise<IDBPDatabase<DBSchema>>>();

  const handleDatabaseError = async (error: unknown): Promise<IDBPDatabase<DBSchema>> => {
    const errorMessage = (error as Error).message || '';

    // Check if it's an object store not found error
    if (errorMessage.includes('object stores was not found') ||
      errorMessage.includes('object store') ||
      (error as Error).name === 'NotFoundError') {
      console.warn('IndexedDB object stores not found. Recreating database...');
      await deleteDatabase();
      cache.clear();
      return await initDB();
    }

    throw error;
  };

  const initDB = async (): Promise<IDBPDatabase<DBSchema>> => {
    const cacheKey = 'db';
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const dbPromise = (async () => {
      try {
        return await createDB();
      } catch (error) {
        // Remove from cache on error so next call will retry
        cache.delete(cacheKey);

        if ((error as Error).name === 'VersionError') {
          console.warn('IndexedDB version mismatch. Clearing database and retrying...');
          await deleteDatabase();
          return await createDB();
        }
        throw error;
      }
    })();

    cache.set(cacheKey, dbPromise);

    try {
      return await dbPromise;
    } catch (error) {
      // Remove from cache if promise rejects
      cache.delete(cacheKey);
      throw error;
    }
  };

  const resetCache = () => {
    cache.clear();
  };

  return { initDB, handleDatabaseError, resetCache };
};

const dbManager = createDBManager();
const initDB = dbManager.initDB;
const handleDatabaseError = dbManager.handleDatabaseError;
const resetDBInstance = dbManager.resetCache;

export const getShielderIndexedDB = (chainId: number, privateKey: Address) => {
  const chainKey = chainId.toString();
  const hashedKey = sha256(privateKey);
  const dbp = initDB();

  return {
    getItem: async (itemKey: string): Promise<string | null> => {
      try {
        const db = await dbp;
        const addrData = await db.get(STORE_CLIENTS, hashedKey);
        return addrData?.[chainKey]?.[itemKey] ?? null;
      } catch (error) {
        console.error('Failed to get item from IndexedDB:', error);
        try {
          const db = await handleDatabaseError(error);
          const addrData = await db.get(STORE_CLIENTS, hashedKey);
          return addrData?.[chainKey]?.[itemKey] ?? null;
        } catch (retryError) {
          console.error('Failed to get item from IndexedDB after retry:', retryError);
          return null;
        }
      }
    },
    setItem: async (itemKey: string, value: string): Promise<void> => {
      try {
        const db = await dbp;
        const addrData = (await db.get(STORE_CLIENTS, hashedKey)) ?? {};
        const chainData = addrData[chainKey] ?? {};
        await db.put(
          STORE_CLIENTS,
          { ...addrData, [chainKey]: { ...chainData, [itemKey]: value }},
          hashedKey,
        );
      } catch (error) {
        console.error('Failed to set item in IndexedDB:', error);
        try {
          const db = await handleDatabaseError(error);
          const addrData = (await db.get(STORE_CLIENTS, hashedKey)) ?? {};
          const chainData = addrData[chainKey] ?? {};
          await db.put(
            STORE_CLIENTS,
            { ...addrData, [chainKey]: { ...chainData, [itemKey]: value }},
            hashedKey,
          );
        } catch (retryError) {
          console.error('Failed to set item in IndexedDB after retry:', retryError);
        }
      }
    },
  };
};

export const getLocalShielderActivityHistoryIndexedDB = (accountAddress: string) => {
  const dbp = initDB();

  return {
    getItems: async (chainId: number) => {
      try {
        const db = await dbp;
        const allChains = await db.get(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY, accountAddress);
        const raw = allChains?.[chainId.toString()];
        return raw ? fromActivityHistoryStorageFormat(raw) : null;
      } catch (error) {
        console.error('Failed to get activity history from IndexedDB:', error);
        try {
          const db = await handleDatabaseError(error);
          const allChains = await db.get(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY, accountAddress);
          const raw = allChains?.[chainId.toString()];
          return raw ? fromActivityHistoryStorageFormat(raw) : null;
        } catch (retryError) {
          console.error('Failed to get activity history from IndexedDB after retry:', retryError);
          return null;
        }
      }
    },
    upsertItem: async (chainId: number, activity: PartialLocalShielderActivityHistory) => {
      try {
        const db = await dbp;
        const chainKey = chainId.toString();
        const allChains = (await db.get(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY, accountAddress)) ?? {};
        const existingRaw = allChains[chainKey];
        const existing = existingRaw ? fromActivityHistoryStorageFormat(existingRaw) : [];

        const isSame = (a: PartialLocalShielderActivityHistory, b: PartialLocalShielderActivityHistory) =>
          (isPresent(a.localId) && a.localId === b.localId) ||
          (isPresent(a.txHash) && a.txHash === b.txHash);

        const matches = existing.filter(item => isSame(item, activity));
        const rest = existing.filter(item => !isSame(item, activity));

        const localOnly = matches.find(i => isPresent(i.localId) && !isPresent(i.txHash)) ?? {};
        const withTxHash = matches.find(i => isPresent(i.txHash)) ?? {};

        const merged = {
          ...localOnly,
          ...withTxHash,
          ...activity,
        };

        const updated: LocalShielderActivityHistoryArray = [...rest, merged];

        await db.put(
          STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY,
          { ...allChains, [chainKey]: toActivityHistoryStorageFormat(updated) },
          accountAddress,
        );

        return merged;
      } catch (error) {
        console.error('Failed to upsert activity history in IndexedDB:', error);
        try {
          const db = await handleDatabaseError(error);
          const chainKey = chainId.toString();
          const allChains = (await db.get(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY, accountAddress)) ?? {};
          const existingRaw = allChains[chainKey];
          const existing = existingRaw ? fromActivityHistoryStorageFormat(existingRaw) : [];

          const isSame = (a: PartialLocalShielderActivityHistory, b: PartialLocalShielderActivityHistory) =>
            (isPresent(a.localId) && a.localId === b.localId) ||
            (isPresent(a.txHash) && a.txHash === b.txHash);

          const matches = existing.filter(item => isSame(item, activity));
          const rest = existing.filter(item => !isSame(item, activity));

          const localOnly = matches.find(i => isPresent(i.localId) && !isPresent(i.txHash)) ?? {};
          const withTxHash = matches.find(i => isPresent(i.txHash)) ?? {};

          const merged = {
            ...localOnly,
            ...withTxHash,
            ...activity,
          };

          const updated: LocalShielderActivityHistoryArray = [...rest, merged];

          await db.put(
            STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY,
            { ...allChains, [chainKey]: toActivityHistoryStorageFormat(updated) },
            accountAddress,
          );

          return merged;
        } catch (retryError) {
          console.error('Failed to upsert activity history in IndexedDB after retry:', retryError);
          throw retryError;
        }
      }
    },
  };
};

export const clearShielderIndexedDB = async (): Promise<void> => {
  try {
    const db = await initDB();
    await Promise.all([db.clear(STORE_CLIENTS), db.clear(STORE_LOCAL_SHIELDER_ACTIVITY_HISTORY)]);
    resetDBInstance(); // Reset instance after clearing to ensure fresh state
  } catch (error) {
    console.error('Failed to clear IndexedDB:', error);
    resetDBInstance(); // Reset instance on error as well
    throw error;
  }
};
