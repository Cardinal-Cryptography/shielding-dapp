import { useAppKit, useDisconnect } from '@reown/appkit/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  ReactNode, useEffect,
} from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'src/domains/misc/utils/getQueryKey';
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
  const { address, isReconnecting, isConnecting, isConnected, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { shielderPrivateKey } = useShielderPrivateKey(address);
  const clearShielderPrivateKeys = useShielderStore(store => store.clearShielderPrivateKeys);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isDisconnected) return;

    queryClient.removeQueries({
      predicate: query =>
        query.queryKey[0] === QUERY_KEYS.shielderPrivateKey,
    });

    void queryClient.removeQueries({
      predicate: query =>
        query.queryKey[0] === QUERY_KEYS.shielderClient,
    });

    clearShielderPrivateKeys();
    void clearShielderIndexedDB();
  }, [address, queryClient, clearShielderPrivateKeys, isDisconnected]);

  const value = {
    disconnect,
    openModal,
    address,
    isConnected,
    isLoading: isReconnecting || isConnecting,
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
