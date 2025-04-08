import { FC } from 'react';
import { Address, Chain } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import alephZero from './chains/alephZero';
import arbitrum from './chains/arbitrum';

export type Definition = {
  id: number,
  name: string,
  ChainIcon: FC,
  NativeTokenIcon: FC,
  whitelistedTokens: Record<Address, {
    icon: FC,
  }>,
  shielderConfig?: {
    shielderContractAddress: Address,
    relayerUrl: string,
  },
} & Pick<Chain, 'id' | 'nativeCurrency' | 'rpcUrls' | 'blockExplorers'>;

export type ChainConfig = Record<NetworkEnvironment, Definition>;

export default {
  alephZero,
  arbitrum,
  // base,
} satisfies Record<string, ChainConfig>;
