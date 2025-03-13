import { openDB, IDBPDatabase } from 'idb';
import { z } from 'zod';

const DB_NAME = 'ShielderStorage';
const STORE_NAME = 'transactions';

const validateBigInt = z.string().transform((value, ctx) => {
  try {
    return BigInt(value);
  } catch {
    ctx.addIssue({
      message: 'Invalid bigint string.',
      code: z.ZodIssueCode.custom,
      fatal: true,
    });
    return z.NEVER;
  }
});

const validateTxHash = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/)
  .transform(val => val as `0x${string}`);

const transactionsSchema = z.array(
  z.object({
    type: z.enum(['NewAccountNative', 'DepositNative', 'WithdrawNative']),
    amount: validateBigInt,
    to: z.string().optional(),
    txHash: validateTxHash,
    block: validateBigInt,
    date: z.number(),
    txFee: validateBigInt,
    relayerFee: validateBigInt.optional(),
  }),
);

export type Transactions = z.infer<typeof transactionsSchema>;

const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 1, {
    upgrade: db => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'txHash' }); // txHash as primary key
      }
    },
  });
};

export const transactionsIndexedDB = async (): Promise<Transactions | null> => {
  try {
    const db = await initDB();
    const allTransactions = await db.getAll(STORE_NAME);
    return transactionsSchema.parse(allTransactions);
  } catch (error) {
    console.error('Failed to fetch transactions from IndexedDB:', error);
    return null;
  }
};

export const save = async (transactions: Transactions): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const transaction of transactions) {
      await store.put({
        ...transaction,
        amount: transaction.amount.toString(),
        block: transaction.block.toString(),
        txFee: transaction.txFee.toString(),
        relayerFee: transaction.relayerFee?.toString(),
      });
    }

    await tx.done;
  } catch (error) {
    console.error('Failed to save transactions in IndexedDB:', error);
  }
};

export const clear = async (): Promise<void> => {
  try {
    const db = await initDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error('Failed to clear IndexedDB:', error);
  }
};
