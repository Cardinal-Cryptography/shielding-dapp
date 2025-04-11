import { createAppKit } from '@reown/appkit/react';
import { LazyMotion, domAnimation } from 'motion/react';
import { ReactNode } from 'react';
import { values } from 'remeda';
import { Toaster } from 'sonner';
import { WagmiProvider } from 'wagmi';

import WalletProvider from 'src/domains/chains/components/WalletProvider';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import definitions from 'src/domains/chains/utils/definitions';
import { QueryClientProvider } from 'src/domains/misc/utils/queryClient';
import WasmProvider from 'src/domains/shielder/utils/WasmProvider';

import GlobalStylesWithTheme from './GlobalStylesWithTheme';

const allSupportedChains = values(definitions).flatMap(definition => values(definition));

createAppKit({
  adapters: [wagmiAdapter],
  networks: [allSupportedChains[0], ...allSupportedChains],
  defaultNetwork: definitions.alephZero.testnet,
  projectId: import.meta.env.PUBLIC_VAR_REOWN_PROJECT_ID,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
});

type Props = {
  children: ReactNode,
};

const Providers = ({ children }: Props) => {

  return (
    <LazyMotion features={domAnimation}>
      <GlobalStylesWithTheme>
        <QueryClientProvider>
          <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <WalletProvider>
              <WasmProvider>
                <Toaster visibleToasts={Infinity} />
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
