import { createAppKit } from '@reown/appkit/react';
import { LazyMotion, domAnimation } from 'motion/react';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import WalletProvider from 'src/domains/chains/components/WalletProvider';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import { Definition } from 'src/domains/chains/utils/definitions';
import { ToastsProvider } from 'src/domains/misc/components/Toast';
import { PRIVACY_POLICY_LINK, TERMS_OF_SERVICE_LINK } from 'src/domains/misc/consts/consts';
import { QueryClientProvider } from 'src/domains/misc/utils/queryClient';
import WasmProvider from 'src/domains/shielder/utils/WasmProvider';

import GlobalStylesWithTheme from './GlobalStylesWithTheme';

createAppKit({
  adapters: [wagmiAdapter],
  networks: wagmiAdapter.wagmiChains as [Definition, ...Definition[]],
  projectId: import.meta.env.PUBLIC_VAR_REOWN_PROJECT_ID,
  termsConditionsUrl: TERMS_OF_SERVICE_LINK,
  privacyPolicyUrl: PRIVACY_POLICY_LINK,
  enableWalletGuide: false,
  // Using `featuredWalletIds` instead of `includeWalletIds`, as `includeWalletIds` still displays all installed wallets.
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', //MetaMask,
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', //Coinbase
    'e0c2e199712878ed272e2c170b585baa0ff0eb50b07521ca586ebf7aeeffc598', //Talisman
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', //Rabby
  ],
  // Hiding the "All Wallets" button so only featured wallets are shown.
  allWallets: 'HIDE',
  chainImages: wagmiAdapter.wagmiChains ?
    Object.fromEntries(wagmiAdapter.wagmiChains.map(c => [c.id, `/chains/${c.id}.svg`])) :
    undefined,
  features: {
    analytics: false,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
    legalCheckbox: true,
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
          <ToastsProvider ttlMs={10_000}>
            <WagmiProvider config={wagmiAdapter.wagmiConfig}>
              <WalletProvider>
                <WasmProvider>
                  {children}
                </WasmProvider>
              </WalletProvider>
            </WagmiProvider>
          </ToastsProvider>
        </QueryClientProvider>
      </GlobalStylesWithTheme>
    </LazyMotion>
  );
};

export default Providers;
