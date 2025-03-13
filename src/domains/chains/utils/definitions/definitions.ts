import { FC } from 'react';
import { Address, Chain } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import alephZero from './chains/alephZero';
import base from './chains/base';

type Definition = {
  name: string,
  ChainIcon: FC,
  NativeTokenIcon: FC,
  whitelistedTokens: Record<Address, {
    icon: FC,
  }>,
} & Pick<Chain, 'id' | 'nativeCurrency' | 'rpcUrls' | 'blockExplorers'>;

export type ChainConfig = Record<NetworkEnvironment, Definition>;

export default {
  alephZero,
  base,
} satisfies Record<string, ChainConfig>;
