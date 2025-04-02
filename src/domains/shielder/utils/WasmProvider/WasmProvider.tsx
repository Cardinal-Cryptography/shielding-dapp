import { CryptoClient } from '@cardinal-cryptography/shielder-sdk-crypto';
import { skipToken, useQuery } from '@tanstack/react-query';
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
  const { isConnected, privateKey } = useWallet();

  const { data, isSuccess } = useQuery({
    queryKey: getQueryKey.wasmCryptoClient(),
    queryFn: isConnected && !!privateKey ? () => wasmCryptoClientRead : skipToken,
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
