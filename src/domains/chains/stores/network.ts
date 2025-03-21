import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

type network = {
  network: NetworkEnvironment,
  setNetwork: (theme: NetworkEnvironment) => void,
};

export const useNetworkStore = create<network>()(
  persist(
    set => ({
      network: 'mainnet',
      setNetwork: network => {
        set({ network });
      },
    }),
    {
      name: 'network',
      partialize: state => ({ network: state.network }),
    }
  )
);
