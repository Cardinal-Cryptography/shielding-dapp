import { createAppKit } from '@reown/appkit/react';
import { LazyMotion, domAnimation } from 'motion/react';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import WalletProvider from 'src/domains/chains/components/WalletProvider';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import { Definition } from 'src/domains/chains/utils/definitions';
import { ModalProvider } from 'src/domains/misc/components/Modal';
import { ToastsProvider } from 'src/domains/misc/components/Toast';
import { QueryClientProvider } from 'src/domains/misc/utils/queryClient';
import WasmProvider from 'src/domains/shielder/utils/WasmProvider';

import GlobalStylesWithTheme from './GlobalStylesWithTheme';
import PostHogProvider from './PostHogProvider';

createAppKit({
  adapters: [wagmiAdapter],
  networks: wagmiAdapter.wagmiChains as [Definition, ...Definition[]],
  projectId: import.meta.env.PUBLIC_VAR_REOWN_PROJECT_ID,
  enableWalletGuide: false,
  // Using `featuredWalletIds` instead of `includeWalletIds`, as `includeWalletIds` still displays all installed wallets.
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', //MetaMask,
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', //Coinbase
    'e0c2e199712878ed272e2c170b585baa0ff0eb50b07521ca586ebf7aeeffc598', //Talisman
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', //Rabby
  ],
  excludeWalletIds: [
    '9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a', // SubWallet
    'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a', // Uniswap
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
    '4119a5b3e5ebc809b6a3680a280ae517b92fead02e4c07b7cec0d3385c87aee2', // xPortal
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
  },
});

type Props = {
  children: ReactNode,
};

const Providers = ({ children }: Props) => (
  <LazyMotion features={domAnimation}>
    <GlobalStylesWithTheme>
      <QueryClientProvider>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <WalletProvider>
            <PostHogProvider>
              <WasmProvider>
                <ToastsProvider ttlMs={10_000}>
                  <ModalProvider>
                    {children}
                  </ModalProvider>
                </ToastsProvider>
              </WasmProvider>
            </PostHogProvider>
          </WalletProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </GlobalStylesWithTheme>
  </LazyMotion>
);

export default Providers;
