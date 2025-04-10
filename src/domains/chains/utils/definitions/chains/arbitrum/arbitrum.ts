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
      '0xaefC07E8821fB684DB23c7e3a6A1CC91B871a954': { icon: SpringIcon },
      '0xbf97a6bea949aabe8324f78b2f5455f7b1f52a78': { icon: UsdtIcon },
    },
  },
};
export default config;
