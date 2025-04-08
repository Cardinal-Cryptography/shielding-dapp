import { arbitrum, arbitrumSepolia } from 'viem/chains';

import UsdtIcon from '../../commonTokensIcons/usdt.svg?react';
import WEthIcon from '../../commonTokensIcons/wEth.svg?react';
import { ChainConfig } from '../../definitions';

import ChainIcon from './arbitrum.svg?react';
import NativeTokenIcon from './nativeToken.svg?react';

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
      shielderContractAddress: '0x4691195fd10716b477B57b673939A99c6c0bc83A',
      relayerUrl: 'https://shielder-relayer-v2.dev.azero.dev/arbitrum-testnet',
    },
    ChainIcon,
    NativeTokenIcon,
    whitelistedTokens: {
      '0xaefC07E8821fB684DB23c7e3a6A1CC91B871a954': { icon: WEthIcon },
      '0xbf97a6bea949aabe8324f78b2f5455f7b1f52a78': { icon: UsdtIcon },
    },
  },
};
export default config;
