import { arbitrum, arbitrumSepolia } from 'viem/chains';

import NativeTokenIcon from '../../commonTokensIcons/eth.svg?react';
import SpringIcon from '../../commonTokensIcons/spring.svg?react';
import UsdtIcon from '../../commonTokensIcons/usdt.svg?react';
import { ChainConfig } from '../../definitions';

import ChainIcon from './arbitrum.svg?react';

const config: ChainConfig = {
  mainnet: {
    ...arbitrum,
    ChainIcon,
    NativeTokenIcon,
    whitelistedTokens: {},
  },
  testnet: {
    ...arbitrumSepolia,
    shielderConfig: {
      shielderContractAddress: '0xca2Ca45089Fa4E2BBef2BF26E632a8CA9CD1aFd0',
      relayerUrl: 'https://shielder-relayer-v2.test.azero.dev/arbitrum-testnet',
    },
    ChainIcon,
    NativeTokenIcon,
    whitelistedTokens: {
      '0x74d98435c773c1D68789Ee2720784E005588b448': { icon: SpringIcon },
      '0x0037A4AAE611b931d626887Bd53028a2a7051A7e': { icon: UsdtIcon },
    },
  },
};
export default config;
