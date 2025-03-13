import { CryptoClient } from '@cardinal-cryptography/shielder-sdk-crypto';
import { createContext, useContext } from 'react';
import { type ReactNode, useEffect, useState } from 'react';

import { wasmCryptoClientRead } from './wasmCryptoClientRead.ts';

type WasmContextType = {
  error: Error | null,
  wasmCryptoClient: CryptoClient | null,
  wasmLoaded: boolean,
};

const WasmContext = createContext<WasmContextType | undefined>(undefined);

type Props = { children: ReactNode };
let wasmCryptoClient: CryptoClient | null = null;

const WasmProvider = ({ children }: Props) => {
  const [error, setError] = useState<Error | null>(null);
  const [wasmLoaded, setWasmLoaded] = useState(false);

  useEffect(() => {
    wasmCryptoClientRead
      .then(cryptoClient => {
        console.log('Wasm loaded');

        wasmCryptoClient = cryptoClient;
        setWasmLoaded(true);
      })
      .catch((err: unknown) => void setError(err as Error));
  }, []);

  return (
    <WasmContext.Provider value={{ error, wasmCryptoClient, wasmLoaded }}>
      {children}
    </WasmContext.Provider>
  );
};

export default WasmProvider;

export const useWasm = () => {
  const context = useContext(WasmContext);
  if (context === undefined) {
    throw new Error('wasmProvider must be used within a WasmProvider.');
  }
  return context;
};
