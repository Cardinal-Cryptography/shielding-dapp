import { Address } from 'viem';

type BaseAsset = {
  isShielded: boolean,
  chain: 'aleph-evm' | 'testnet-aleph-evm',
};

export type TokenAsset = {
  isNative: false,
  tokenAddress: Address,
} & BaseAsset;

export type NativeAsset = {
  isNative: true,
  tokenAddress?: never,
} & BaseAsset;

export type Asset = TokenAsset | NativeAsset;
