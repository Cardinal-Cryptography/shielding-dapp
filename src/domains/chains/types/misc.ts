import { Address } from 'viem';

import chainsDefinitions from '../utils/definitions/definitions';

export type Token = {
  chain: keyof typeof chainsDefinitions,
} & (
  {
    isNative: true,
    address?: never,
  } | {
    isNative: false,
    address: Address,
  }
);

export type NetworkEnvironment = 'mainnet' | 'testnet';
