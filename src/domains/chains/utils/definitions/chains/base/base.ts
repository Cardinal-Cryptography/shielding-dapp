import { base, baseSepolia } from 'viem/chains';

import NativeTokenIcon from '../../commonTokensIcons/eth.svg?react';
import UsdcIcon from '../../commonTokensIcons/usdc.svg?react';
import UsdtIcon from '../../commonTokensIcons/usdt.svg?react';
import WBtcIcon from '../../commonTokensIcons/wBtc.svg?react';
import WEthIcon from '../../commonTokensIcons/wBtc.svg?react';
import { ChainConfig } from '../../definitions';

import ChainIcon from './base.svg?react';

const config: ChainConfig = {
  mainnet: {
    ...base,
    ChainIcon,
    NativeTokenIcon,
    whitelistedTokens: {
      '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c': { icon: WBtcIcon },
      '0xf28587b974BF0323d1f17F65eF33D19b66f4a97d': { icon: WBtcIcon },
      '0x4200000000000000000000000000000000000006': { icon: WEthIcon },
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': { icon: UsdcIcon },
      '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2': { icon: UsdtIcon },
    },
  },
  testnet: {
    ...baseSepolia,
    shielderConfig: {
      shielderContractAddress: '0x72B16db09D234A69a7e2df05503923A885eCe0Ea',
      relayerUrl: 'https://shielder-relayer-dev.test.azero.dev',
    },
    ChainIcon,
    NativeTokenIcon,
    whitelistedTokens: {
      '0x1bf0aeb4C1A1C0896887814d679defcc1325EdE3': { icon: WBtcIcon },
      '0xE707a4609c5c34b6F7328dd674DBb0823E575963': { icon: WBtcIcon },
      '0x4200000000000000000000000000000000000006': { icon: WEthIcon },
      '0xf7464321dE37BdE4C03AAeeF6b1e7b71379A9a64': { icon: UsdcIcon },
      '0xd7e9C75C6C05FdE929cAc19bb887892de78819B7': { icon: UsdtIcon },
    },
  },
};
export default config;
