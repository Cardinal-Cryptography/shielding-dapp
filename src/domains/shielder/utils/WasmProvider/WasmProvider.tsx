import { CryptoClient } from '@cardinal-cryptography/shielder-sdk-crypto';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import { type ReactNode } from 'react';

import getQueryKey from 'src/domains/misc/utils/getQueryKey.ts';

import { wasmCryptoClientRead } from './wasmCryptoClientRead.ts';

type WasmContextType = {
  wasmCryptoClient: CryptoClient | null,
  wasmLoaded: boolean,
};

const WasmContext = createContext<WasmContextType | undefined>(undefined);

type Props = { children: ReactNode };

const WasmProvider = ({ children }: Props) => {
  const { data, isSuccess } = useQuery({
    queryKey: getQueryKey.wasmCryptoClient(),
    queryFn: () => wasmCryptoClientRead,
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
