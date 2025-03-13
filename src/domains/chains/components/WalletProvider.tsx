import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import { Address } from 'viem';

import { getWalletClient, getEthereumProvider } from '../utils/clients';

type WalletContextType = {
  account?: Address,
  error: Error | null,
  loading: boolean,
  connectWallet: () => Promise<void>,
  disconnectWallet: () => Promise<void>,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<Address>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const updateAccount = async () => {
    try {
      const walletClient = await getWalletClient();
      setAccount((await walletClient.getAddresses())[0]);
    } catch (err) {
      setError(err as Error);
    }
  };

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const provider = await getEthereumProvider();
        if (provider.session) await updateAccount();
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await (await getEthereumProvider()).connect();
      await updateAccount();
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await (await getEthereumProvider()).disconnect();
      setAccount(undefined);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => (
    { account, error, loading, connectWallet, disconnectWallet }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [account, error, loading]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};

export default WalletProvider;
