import { useAppKit, useDisconnect } from '@reown/appkit/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import useConnectedChainNetworkEnvironment from 'src/domains/chains/utils/useConnectedChainNetworkEnvironment';
import useSyncChainWithUrl from 'src/domains/chains/utils/useSyncChainWithUrl';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import { clearShielderIndexedDB } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useShielderStore from 'src/domains/shielder/stores/shielder';
import useShielderPrivateKey from 'src/domains/shielder/utils/useShielderPrivateKey';

type WalletContextType = {
  openModal: ReturnType<typeof useAppKit>['open'],
  isLoading: boolean,
  isConnected: boolean,
  disconnect: () => Promise<void>,
  address?: Address,
  privateKey: Address | undefined,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { open: openModal } = useAppKit();
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { shielderPrivateKey } = useShielderPrivateKey(address);
  const clearShielderPrivateKeys = useShielderStore(store => store.clearShielderPrivateKeys);

  const queryClient = useQueryClient();

  const networkEnvironment = useConnectedChainNetworkEnvironment();

  useSyncChainWithUrl();

  const handleDisconnect = async () => {
    if(address && networkEnvironment) {
      queryClient.removeQueries({
        queryKey: getQueryKey.shielderPrivateKey(address, networkEnvironment),
      });
    }
    void queryClient.removeQueries({
      predicate: query =>
        query.queryKey[0] === 'shielder-client',
    });

    clearShielderPrivateKeys();
    await clearShielderIndexedDB();
    await disconnect();
  };

  const value = {
    disconnect: handleDisconnect,
    openModal,
    address,
    isConnected,
    isLoading: status !== 'connected' && status !== 'disconnected',
    privateKey: shielderPrivateKey,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};

export default WalletProvider;
