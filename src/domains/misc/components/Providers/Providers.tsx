import { createAppKit } from '@reown/appkit/react';
import { LazyMotion, domAnimation } from 'motion/react';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import WalletProvider from 'src/domains/chains/components/WalletProvider';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import definitions, { Definition } from 'src/domains/chains/utils/definitions';
import { QueryClientProvider } from 'src/domains/misc/utils/queryClient';
import WasmProvider from 'src/domains/shielder/utils/WasmProvider';

import GlobalStylesWithTheme from './GlobalStylesWithTheme';

type Props = {
  children: ReactNode,
};

const Providers = ({ children }: Props) => {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: wagmiAdapter.wagmiChains as [Definition, ...Definition[]],
    defaultNetwork: definitions.alephZero.testnet,
    projectId: import.meta.env.PUBLIC_VAR_REOWN_PROJECT_ID,
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
  });

  return (
    <LazyMotion features={domAnimation}>
      <GlobalStylesWithTheme>
        <QueryClientProvider>
          <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <WalletProvider>
              <WasmProvider>
                {children}
              </WasmProvider>
            </WalletProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </GlobalStylesWithTheme>
    </LazyMotion>
  );
};

export default Providers;
