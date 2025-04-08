import UsdcIcon from '../../commonTokensIcons/usdc.svg?react';
import UsdtIcon from '../../commonTokensIcons/usdt.svg?react';
import WAzeroIcon from '../../commonTokensIcons/wAzero.svg?react';
import WBtcIcon from '../../commonTokensIcons/wBtc.svg?react';
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
      '0x27a1Bb249A2973D01264e8e43Ee9be2424F1a52B': { icon: UsdtIcon },
    },
  },
  testnet: {
    name: 'Aleph Zero',
    ChainIcon,
    NativeTokenIcon,
    id: 2039,
    shielderConfig: {
      shielderContractAddress: '0x0037A4AAE611b931d626887Bd53028a2a7051A7e',
      relayerUrl: 'https://shielder-relayer-v2.dev.azero.dev/azero-testnet',
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
      '0x1C66D6187B318f10Eb1A8BD986451DF02BE3DbAC': { icon: WEthIcon },
      '0x27a1Bb249A2973D01264e8e43Ee9be2424F1a52B': { icon: UsdtIcon },
    },
  },
};
export default config;
