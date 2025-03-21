import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import { Address } from 'viem';

import { NEVER_CHANGING_DATA_OPTIONS } from 'src/domains/misc/consts/consts.ts';

import { getWalletClient, getEthereumProvider } from '../utils/clients';

const WALLET_QUERY_KEY = ['wallet-address'];

type WalletContextType = {
  account?: Address,
  loading: boolean,
  error: Error | null,
  connectWallet: () => Promise<void>,
  disconnectWallet: () => Promise<void>,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WalletProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const {
    data: account,
    isLoading,
    error: addressError,
  } = useQuery<Address | undefined>({
    queryKey: WALLET_QUERY_KEY,
    queryFn: async () => {
      const provider = await getEthereumProvider();
      if (!provider.session) return undefined;

      const walletClient = await getWalletClient();
      const addresses = await walletClient.getAddresses();
      return addresses[0];
    },
    ...NEVER_CHANGING_DATA_OPTIONS,
  });

  const {
    mutateAsync: connectWallet,
    error: connectError,
  } = useMutation({
    mutationFn: async () => {
      const provider = await getEthereumProvider();
      await provider.connect();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    },
  });

  const {
    mutateAsync: disconnectWallet,
    error: disconnectError,
  } = useMutation({
    mutationFn: async () => {
      const provider = await getEthereumProvider();
      await provider.disconnect();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: WALLET_QUERY_KEY });
    },
  });

  const value = useMemo<WalletContextType>(() => ({
    account,
    loading: isLoading,
    error: addressError ?? connectError ?? disconnectError ?? null,
    connectWallet,
    disconnectWallet,
  }), [account, isLoading, addressError, connectError, disconnectError, connectWallet, disconnectWallet]);

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
