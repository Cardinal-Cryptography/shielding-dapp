import { ComponentType } from 'react';

import { Token } from 'src/domains/chains/types/misc.ts';
import definitions from 'src/domains/chains/utils/definitions';

export type TokenListToken = Token & {
  chain: keyof typeof definitions,
  name: string | undefined,
  symbol: string | undefined,
  address: string | undefined,
  decimals: number | undefined,
  icon: ComponentType | undefined,
  balance?: {
    atomic?: bigint | string | number,
    usd?: number,
  },
  usdPrice?: number,
};
