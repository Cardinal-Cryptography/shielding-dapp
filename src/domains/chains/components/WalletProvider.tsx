import { useAppKit, useDisconnect } from '@reown/appkit/react';
import {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { useShielderStore } from 'src/domains/shielder/stores/shielder';

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
  const { shielderPrivateKey } = useShielderStore(address);

  const value = {
    disconnect,
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
