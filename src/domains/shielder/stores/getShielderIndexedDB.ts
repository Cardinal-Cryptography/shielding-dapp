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
  token: z.object({ type: z.string() }).passthrough(),
  pocketMoney: z.bigint().optional(),
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

const initDB = async (): Promise<IDBPDatabase<DBSchema>> => {
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

export const getShielderIndexedDB = (chainId: number, privateKey: Address) => {
  const chainKey = chainId.toString();
  const hashedPrivateKey = sha256(privateKey);
  const initDbPromise = initDB();

  return {
    getItem: async (itemKey: string): Promise<string | null> => {
      const db = await initDbPromise;
      const allDataForAddress = await db.get(STORE_CLIENTS, hashedPrivateKey);
      const chainData = allDataForAddress?.[chainKey];
      return chainData?.[itemKey] ?? null;
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
      const db = await initDbPromise;
      const allChains = await db.get(STORE_TRANSACTIONS, accountAddress);
      const rawTransactions = allChains?.[chainId.toString()];
      return rawTransactions ? fromStorageFormat(rawTransactions) : null;
    },
    addItem: async (chainId: number, tx: ShielderTransaction): Promise<void> => {
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
          existing.txHash === tx.txHash ? tx : existing
        ) :
        [...existingTransactions, tx];

      const updatedAllChains = {
        ...currentAllChains,
        [chainKey]: toStorageFormat(updatedTransactions),
      };

      await db.put(STORE_TRANSACTIONS, updatedAllChains, accountAddress);
    },
  };
};
