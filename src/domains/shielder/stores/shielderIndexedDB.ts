import { InjectedStorageInterface } from '@cardinal-cryptography/shielder-sdk';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ShielderStorage';
const STORE_NAME = 'shielderClients';

// Define a strict type for stored data
type ShielderClientData = Record<string, string>;

const initDB = async (): Promise<IDBPDatabase<{
  shielderClients: ShielderClientData,
}>> => {
  return openDB(DB_NAME, 1, {
    upgrade: db => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const shielderIndexedDB = (chainId: number): InjectedStorageInterface => {
  return {
    getItem: async (key: string): Promise<string | null> => {
      const db = await initDB();
      const shielderClientNamespaced = (await db.get(STORE_NAME, chainId.toString())) as ShielderClientData | undefined;
      return shielderClientNamespaced?.[key] ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
      const db = await initDB();
      const shielderClientNamespaced =
          (await db.get(STORE_NAME, chainId.toString())) as ShielderClientData | undefined ?? {};
      shielderClientNamespaced[key] = value;
      await db.put(STORE_NAME, shielderClientNamespaced, chainId.toString());
    },
  };
};
