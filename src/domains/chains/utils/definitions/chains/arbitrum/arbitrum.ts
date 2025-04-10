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
      '0x44d7d80723649e3e18fc60ab632f886057b2229b': { icon: SpringIcon },
      '0x60765dca7209fbd482fee331114f764bf3bf55bd': { icon: UsdtIcon },
    },
  },
};
export default config;
