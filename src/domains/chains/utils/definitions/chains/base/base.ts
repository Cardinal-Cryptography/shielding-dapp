import { baseSepolia } from 'viem/chains';

import CBtcIcon from '../../commonTokensIcons/cBtc.svg?react';
import NativeTokenIcon from '../../commonTokensIcons/eth.svg?react';
import UsdcIcon from '../../commonTokensIcons/usdc.svg?react';
import { ChainConfig } from '../../definitions';

import ChainIcon from './base.svg?react';

const config: ChainConfig = {
  testnet: {
    ...baseSepolia,
    shielderConfig: {
      shielderContractAddress: '0x2098a5f59DAB63F1a2aB7C0715DA437D1efB012B',
      relayerUrl: 'https://shielder-relayer-v2.test.azero.dev/base-testnet',
      shieldingFeeEstimatorUrl: 'https://fee-estimator.test.azero.dev/base-testnet/get_fees',
    },
    ChainIcon,
    NativeTokenIcon,
    whitelistedTokens: {
      '0x31e9bF3Bd30204360C966E0cE4e33ED0A74C8556': { icon: CBtcIcon },
      '0xda3699eb401Ce640bdBfCE148A9D00FA652409e1': { icon: UsdcIcon },
    },
    urlPathSegment: 'base-sepolia',
  },
};
export default config;
