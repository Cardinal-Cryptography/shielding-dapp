import { arbitrum, arbitrumSepolia } from 'viem/chains';

import ArbIcon from '../../commonTokensIcons/arb.svg?react';
import NativeTokenIcon from '../../commonTokensIcons/eth.svg?react';
import SpringIcon from '../../commonTokensIcons/spring.svg?react';
import UsdcIcon from '../../commonTokensIcons/usdc.svg?react';
import UsdtIcon from '../../commonTokensIcons/usdt.svg?react';
import { ChainConfig } from '../../definitions';

import ChainIcon from './arbitrum.svg?react';

const config: ChainConfig = {
  mainnet: {
    ...arbitrum,
    shielderConfig: {
      shielderContractAddress: '0x5A0dea46A96a5b578c9cf1730f461eD0bC9C32c6',
      relayerUrl: 'https://shielder-relayer-v2.azero.dev/arbitrum',
    },
    ChainIcon,
    NativeTokenIcon,
    whitelistedTokens: {
      '0x912CE59144191C1204E64559FE8253a0e49E6548': { icon: ArbIcon },
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': { icon: UsdcIcon },
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': { icon: UsdtIcon },
    },
    urlPathSegment: 'arbitrum',
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
      '0x44D7d80723649E3e18fC60Ab632f886057B2229B': { icon: SpringIcon },
      '0x60765dCa7209fBD482fEE331114F764BF3BF55BD': { icon: UsdtIcon },
    },
    urlPathSegment: 'arbitrum-sepolia',
  },
};
export default config;
