import { IconName } from 'src/domains/misc/components/CIcon';

export type Token = {
  chain: 'alephEvm',
  name: string | undefined,
  symbol: string | undefined,
  address: string,
  decimals: number | undefined,
  icon: IconName | undefined,
  balance?: {
    atomic: bigint | string,
    usd?: number,
  },
  usdPrice?: number,
};
