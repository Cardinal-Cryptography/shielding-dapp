import { ComponentType } from 'react';
import { Address, Chain } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import alephZero from './chains/alephZero';
import arbitrum from './chains/arbitrum';
import base from './chains/base';

export type Definition = {
  id: number,
  name: string,
  ChainIcon: ComponentType,
  NativeTokenIcon: ComponentType,
  whitelistedTokens: Record<Address, {
    icon: ComponentType,
  }>,
  shielderConfig?: {
    shielderContractAddress: Address,
    relayerUrl: string,
  },
  urlPathSegment: string,
} & Pick<Chain, 'id' | 'nativeCurrency' | 'rpcUrls' | 'blockExplorers'>;

export type ChainConfig = Partial<Record<NetworkEnvironment, Definition>>;

export default {
  alephZero,
  arbitrum,
  base,
} satisfies Record<string, ChainConfig>;
