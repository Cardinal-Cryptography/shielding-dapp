import SpringIcon from '../../commonTokensIcons/spring.svg?react';
import UsdcIcon from '../../commonTokensIcons/usdc.svg?react';
import UsdtIcon from '../../commonTokensIcons/usdt.svg?react';
import WEthIcon from '../../commonTokensIcons/wEth.svg?react';
import { ChainConfig } from '../../definitions';

import ChainIcon from './alephZeroEvm.svg?react';
import NativeTokenIcon from './nativeToken.svg?react';

const config: ChainConfig = {
  mainnet: {
    name: 'Aleph Zero',
    ChainIcon,
    NativeTokenIcon,
    id: 41455,
    shielderConfig: {
      shielderContractAddress: '0x5A0dea46A96a5b578c9cf1730f461eD0bC9C32c6',
      relayerUrl: 'https://shielder-relayer-v2.azero.dev/azero',
      shieldingFeeEstimatorUrl: 'https://fee-estimator.azero.dev/azero/get_fees',
    },
    nativeCurrency: {
      decimals: 18,
      name: 'AZERO',
      symbol: 'AZERO',
    },
    rpcUrls: {
      default: {
        http: [
          'https://rpc.alephzero.raas.gelato.cloud/eb3f950086814159ac825dae3fb6932f',
          'https://rpc.alephzero.raas.gelato.cloud',
          'https://alephzero.drpc.org',
        ],
        webSocket: [
          'wss://ws.alephzero.raas.gelato.cloud/eb3f950086814159ac825dae3fb6932f',
          'wss://ws.alephzero.raas.gelato.cloud',
          'wss://alephzero.drpc.org',
        ],
      },
    },
    blockExplorers: {
      default: {
        name: 'Blockscout',
        url: 'https://evm-explorer.alephzero.org',
      },
    },
    whitelistedTokens: {
      '0xB3f0eE446723f4258862D949B4c9688e7e7d35d3': { icon: WEthIcon },
      '0x18d25B4e18165c97e1285212e5d1f80eDD6d3Aa7': { icon: UsdcIcon },
      '0xD648529D4803d3467bA8850577BEd4e4b8Ae583C': { icon: UsdtIcon },
    },
    urlPathSegment: 'aleph-zero',
  },
  testnet: {
    name: 'Aleph Zero EVM Testnet',
    ChainIcon,
    NativeTokenIcon,
    id: 2039,
    shielderConfig: {
      shielderContractAddress: '0x5B496EB83172B52885f80207426042eA21597077',
      relayerUrl: 'https://shielder-relayer-v2.test.azero.dev/azero-testnet',
      shieldingFeeEstimatorUrl: 'https://fee-estimator.test.azero.dev/azero-testnet/get_fees',
    },
    nativeCurrency: {
      decimals: 18,
      name: 'TZERO',
      symbol: 'TZERO',
    },
    rpcUrls: {
      default: {
        http: [
          'https://rpc.alephzero-testnet.gelato.digital/eb3f950086814159ac825dae3fb6932f',
          'https://rpc.alephzero-testnet.gelato.digital',
          'https://alephzero-sepolia.drpc.org',
        ],
        webSocket: [
          'wss://ws.alephzero-testnet.gelato.digital/eb3f950086814159ac825dae3fb6932f',
          'wss://rpc.alephzero-testnet.gelato.digital',
          'wss://alephzero-sepolia.drpc.org',
        ],
      },
    },
    blockExplorers: {
      default: {
        name: 'Blockscout',
        url: 'https://evm-explorer-testnet.alephzero.org',
      },
    },
    whitelistedTokens: {
      '0xE907112ed7c64c7C9317Ca742d848D0Ef0198fFA': { icon: SpringIcon },
      '0x57b7789b78A4606aFbe8138f6F9D4820D100096E': { icon: UsdtIcon },
    },
    urlPathSegment: 'aleph-zero-testnet',
  },
};
export default config;
