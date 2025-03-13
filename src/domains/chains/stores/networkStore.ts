import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

type networkStore = {
  network: NetworkEnvironment,
  setNetwork: (theme: NetworkEnvironment) => void,
};

export const useNetworkStore = create<networkStore>()(
  persist(
    set => ({
      network: 'mainnet',
      setNetwork: network => {
        set({ network });
      },
    }),
    {
      name: 'network-storage',
      partialize: state => ({ network: state.network }),
    }
  )
);
