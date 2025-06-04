import { CryptoClient } from '@cardinal-cryptography/shielder-sdk-crypto';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import { type ReactNode } from 'react';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';

import { wasmCryptoClientRead } from './wasmCryptoClientRead';

type WasmContextType = {
  wasmCryptoClient: CryptoClient | null,
  wasmLoaded: boolean,
};

const WasmContext = createContext<WasmContextType | undefined>(undefined);

type Props = { children: ReactNode };

const WasmProvider = ({ children }: Props) => {
  const { isConnected } = useWallet();

  const { data, isSuccess } = useQuery({
    enabled: isConnected,
    queryKey: getQueryKey.wasmCryptoClient(),
    queryFn: () => wasmCryptoClientRead(),
    staleTime: Infinity,
  });

  return (
    <WasmContext.Provider
      value={{
        wasmCryptoClient: data ?? null,
        wasmLoaded: isSuccess,
      }}
    >
      {children}
    </WasmContext.Provider>
  );
};

export default WasmProvider;

export const useWasm = () => {
  const context = useContext(WasmContext);
  if (context === undefined) {
    throw new Error('useWasm must be used within a WasmProvider.');
  }
  return context;
};
