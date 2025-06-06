import { Address, Hex } from 'viem';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';
import { AccountType } from 'src/domains/shielder/types/types';

type AccountAddress = Address;
type PrivateKey = Hex;
type ShielderStore = {
  shielderPrivateKeys: Partial<Record<NetworkEnvironment, Record<AccountAddress, PrivateKey>>>,
  setShielderPrivateKeys: (
    networkEnvironment: NetworkEnvironment,
    address: AccountAddress,
    privateKey: PrivateKey,
  ) => void,
  selectedAccountType: AccountType,
  setSelectedAccountType: (accountType:AccountType) => void,
  clearShielderPrivateKeys: () => void,
};

const useShielderStore = create<ShielderStore>()(
  persist(
    set => ({
      selectedAccountType: 'public',
      setSelectedAccountType: accountType => {
        set({ selectedAccountType: accountType });
      },
      shielderPrivateKeys: {},
      setShielderPrivateKeys: (networkEnvironment, accountAddress, privateKey) => {
        set(state => ({
          shielderPrivateKeys: {
            ...state.shielderPrivateKeys,
            [networkEnvironment]: {
              ...state.shielderPrivateKeys[networkEnvironment],
              [accountAddress]: privateKey,
            },
          },
        }));
      },
      clearShielderPrivateKeys: () => {
        set({ shielderPrivateKeys: {}});
      },
    }),
    {
      name: 'shielder',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        shielderPrivateKeys: state.shielderPrivateKeys,
        selectedAccountType: state.selectedAccountType,
      }),
    }
  )
);

export default useShielderStore;
