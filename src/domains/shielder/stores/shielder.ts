import { objectEntries } from 'tsafe';
import { Address } from 'viem';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ShielderStore = {
  shielderPrivateKeySeeds: Record<Address, Address>,
  setShielderPrivateKeySeeds: (address: Address, privateKeySeed: Address) => void,
  removePrivateKeys: (addresses: Address[]) => void,
};

const useShielderInternalStore = create<ShielderStore>()(
  persist(
    set => ({
      shielderPrivateKeySeeds: {},
      setShielderPrivateKeySeeds: (accountAddress, privateKeySeed) => {
        set(state => ({
          shielderPrivateKeySeeds: {
            ...state.shielderPrivateKeySeeds,
            [accountAddress]: privateKeySeed,
          },
        }));
      },
      removePrivateKeys: addresses => {
        set(state => ({
          shielderPrivateKeySeeds: Object.fromEntries(
            objectEntries(state.shielderPrivateKeySeeds).filter(([key]) => !addresses.includes(key))
          ),
        }));
      },
    }),
    {
      name: 'shielder',
      partialize: state => ({ shielderPrivateKeySeeds: state.shielderPrivateKeySeeds }),
    }
  )
);

export const useShielderStore = (address?: Address) => {
  const { shielderPrivateKeySeeds, setShielderPrivateKeySeeds, removePrivateKeys } = useShielderInternalStore();

  return {
    shielderPrivateKey: address ? shielderPrivateKeySeeds[address] : undefined,
    setShielderPrivateKeySeeds,
    removePrivateKeys,
  };
};
