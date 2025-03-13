import UsdcIcon from '../../commonTokensIcons/usdc.svg?react';
import UsdtIcon from '../../commonTokensIcons/usdt.svg?react';
import WAzeroIcon from '../../commonTokensIcons/wAzero.svg?react';
import WBtcIcon from '../../commonTokensIcons/wBtc.svg?react';
import WEthIcon from '../../commonTokensIcons/wBtc.svg?react';
import { ChainConfig } from '../../definitions';

import ChainIcon from './alephZeroEvm.svg?react';
import NativeTokenIcon from './nativeToken.svg?react';

const config: ChainConfig = {
  mainnet: {
    name: 'Aleph Zero',
    ChainIcon,
    NativeTokenIcon,
    id: 41455,
    nativeCurrency: {
      decimals: 18,
      name: 'AZERO',
      symbol: 'AZERO',
    },
    rpcUrls: {
      default: {
        http: [
          'https://rpc.alephzero.raas.gelato.cloud',
          'https://alephzero.drpc.org',
        ],
        webSocket: [
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
      '0xb7Da55D7040ef9C887e20374D76A88F93A59119E': { icon: WAzeroIcon },
      '0x5be9D19Ed24c8C31f4b1FA78A555a97eD462582D': { icon: WBtcIcon },
      '0xB3f0eE446723f4258862D949B4c9688e7e7d35d3': { icon: WEthIcon },
      '0x18d25B4e18165c97e1285212e5d1f80eDD6d3Aa7': { icon: UsdcIcon },
      '0xD648529D4803d3467bA8850577BEd4e4b8Ae583C': { icon: UsdtIcon },
    },
  },
  testnet: {
    name: 'Aleph Zero',
    ChainIcon,
    NativeTokenIcon,
    id: 2039,
    shielderConfig: {
      shielderContractAddress: '0x7126761c7E18915C891c215a23100739492B78a1',
      relayerUrl: 'https://shielder-relayer-dev.test.azero.dev',
    },
    nativeCurrency: {
      decimals: 18,
      name: 'TZERO',
      symbol: 'TZERO',
    },
    rpcUrls: {
      default: {
        http: [
          'https://rpc.alephzero-testnet.gelato.digital',
          'https://alephzero-sepolia.drpc.org',
        ],
        webSocket: [
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
      '0xcC1141eEd15EB519b08cA38A2Ee75AB8025F0DA9': { icon: WAzeroIcon },
      '0x50Cb1A86F64E065F1763E9c5B3a8FA321dad9402': { icon: WBtcIcon },
      '0x189d0D5409F244B78C86cdcF9331B276363bDDa1': { icon: WEthIcon },
      '0xc1947a75696731548651dD40CcB22D23fEA71AF3': { icon: UsdcIcon },
      '0x8fceA92b10b7ee07fc625Cd3441Bbe65E9F472f2': { icon: UsdtIcon },
    },
  },
};
export default config;
