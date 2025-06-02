import { ShielderTransaction } from '@cardinal-cryptography/shielder-sdk';
import { openDB, IDBPDatabase } from 'idb';
import { Address, sha256 } from 'viem';
import { z } from 'zod';

const DB_NAME = 'SHIELDER_STORAGE';
const DB_VERSION = 2;

const STORE_CLIENTS = 'clients';
const STORE_TRANSACTIONS = 'transactions';

type ShielderClientData = Record<string, Record<string, string>>;

const transactionSchema = z.object({
  type: z.enum(['NewAccount', 'Deposit', 'Withdraw']),
  amount: z.bigint(),
  to: z.string().optional(),
  relayerFee: z.bigint().optional(),
  txHash: z.string().transform(val => val as `0x${string}`),
  block: z.bigint(),
  token: z.object({ type: z.string(), address: z.string().optional() }).passthrough(),
  pocketMoney: z.bigint().optional(),
  // Optional for backward compatibility — older records may not include it
  timestamp: z.number().optional(),
  // Optional for backward compatibility — older records may not include it
  provingTimeMillis: z.number().optional(),
});

type Transactions = z.infer<ReturnType<typeof z.array<typeof transactionSchema>>>;
type StoredTransactions = ReturnType<typeof toStorageFormat>;
type TransactionsByChain = Partial<Record<string, StoredTransactions>>;

const toStorageFormat = (txs: Transactions) =>
  txs.map(tx => ({
    ...tx,
    amount: tx.amount.toString(),
    block: tx.block.toString(),
    relayerFee: tx.relayerFee?.toString(),
    pocketMoney: tx.pocketMoney?.toString(),
  }));

const fromStorageFormat = (data: unknown): Transactions =>
  z.array(
    transactionSchema.extend({
      amount: z.string().transform(BigInt),
      block: z.string().transform(BigInt),
      relayerFee: z.string().transform(BigInt).optional(),
      pocketMoney: z.string().transform(BigInt).optional(),
    })
  ).parse(data);

type DBSchema = {
  [STORE_CLIENTS]: {
    key: string,
    value: ShielderClientData,
  },
  [STORE_TRANSACTIONS]: {
    key: string,
    value: TransactionsByChain,
  },
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
      if (!db.objectStoreNames.contains(STORE_CLIENTS)) {
        db.createObjectStore(STORE_CLIENTS);
      }
      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.createObjectStore(STORE_TRANSACTIONS);
      }
    },
  });
};

const initDB = async (): Promise<IDBPDatabase<DBSchema>> => {
  try {
    return await createDB();
  } catch (error) {
    if ((error as Error).name === 'VersionError') {
      console.warn('IndexedDB version mismatch. Clearing database and retrying...');
      await deleteDatabase();
      return await createDB();
    }
    throw error;
  }
};

export const getShielderIndexedDB = (chainId: number, privateKey: Address) => {
  const chainKey = chainId.toString();
  const hashedPrivateKey = sha256(privateKey);
  const initDbPromise = initDB();

  return {
    getItem: async (itemKey: string): Promise<string | null> => {
      try {
        const db = await initDbPromise;
        const allDataForAddress = await db.get(STORE_CLIENTS, hashedPrivateKey);
        const chainData = allDataForAddress?.[chainKey];
        return chainData?.[itemKey] ?? null;
      } catch (error) {
        console.error('Failed to get item from IndexedDB:', error);
        return null;
      }
    },
    setItem: async (itemKey: string, value: string): Promise<void> => {
      const db = await initDbPromise;
      const allDataForAddress = (await db.get(STORE_CLIENTS, hashedPrivateKey)) ?? {};
      const existingChainData = allDataForAddress[chainKey] ?? {};

      const updatedChainData = {
        ...existingChainData,
        [itemKey]: value,
      };

      const updatedAllData = {
        ...allDataForAddress,
        [chainKey]: updatedChainData,
      };

      await db.put(STORE_CLIENTS, updatedAllData, hashedPrivateKey);
    },
  };
};

export const getTransactionsIndexedDB = (accountAddress: string) => {
  const initDbPromise = initDB();

  return {
    getItem: async (chainId: number): Promise<Transactions | null> => {
      try {
        const db = await initDbPromise;
        const allChains = await db.get(STORE_TRANSACTIONS, accountAddress);
        const rawTransactions = allChains?.[chainId.toString()];
        return rawTransactions ? fromStorageFormat(rawTransactions) : null;
      } catch (error) {
        console.error('Failed to get transactions from IndexedDB:', error);
        return null;
      }
    },
    addItem: async (
      chainId: number,
      tx: ShielderTransaction,
      provingTimeMillis: number | undefined,
      timestamp: number | undefined
    ): Promise<void> => {
      const txWithTimestamp = {
        ...tx,
        timestamp,
        provingTimeMillis,
      };

      const db = await initDbPromise;
      const currentAllChains = (await db.get(STORE_TRANSACTIONS, accountAddress)) ?? {};
      const chainKey = chainId.toString();

      const existingRaw = currentAllChains[chainKey];
      const existingTransactions = existingRaw ? fromStorageFormat(existingRaw) : [];

      const isExistingTransaction = existingTransactions.some(
        existing => existing.txHash === tx.txHash
      );

      const updatedTransactions = isExistingTransaction ?
        existingTransactions.map(existing =>
          existing.txHash === tx.txHash ? txWithTimestamp : existing
        ) :
        [...existingTransactions, txWithTimestamp];

      const updatedAllChains = {
        ...currentAllChains,
        [chainKey]: toStorageFormat(updatedTransactions),
      };

      await db.put(STORE_TRANSACTIONS, updatedAllChains, accountAddress);
    },
  };
};

export const clearShielderIndexedDB = async (): Promise<void> => {
  const db = await openDB(DB_NAME, DB_VERSION);

  await Promise.all(
    [STORE_CLIENTS, STORE_TRANSACTIONS]
      .map(store => typeof db.clear === 'function' ? db.clear(store) : undefined)
  );
};
