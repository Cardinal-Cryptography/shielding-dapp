export const QUERY_KEYS = {
  shielderFees: 'shielderFees',
  shielderClient: 'shielder-client',
  shielderTransactions: 'shielder-transactions',
  tokenDecimals: 'token-decimals',
  tokenName: 'token-name',
  tokenSymbol: 'token-symbol',
  tokenPublicBalance: 'token-public-balance',
  tokenShieldedBalance: 'token-shielded-balance',
  shielderPrivateKey: 'shielderPrivateKey',
  wasmCryptoClient: 'wasm-crypto-client',
} as const;

import type { Address } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

const getQueryKey = {
  shielderFees: (walletAddress: Address, chainId: string) => [
    QUERY_KEYS.shielderFees,
    walletAddress,
    chainId,
  ],
  shielderClient: (chainId: number, shielderPrivateKey: Address) => [
    QUERY_KEYS.shielderClient,
    chainId,
    shielderPrivateKey,
  ],
  shielderTransactions: (accountAddress: Address, chainId: number) => [
    QUERY_KEYS.shielderTransactions,
    accountAddress,
    chainId,
  ],
  tokenDecimals: (
    tokenAddress: Address | 'native',
    chainId: string
  ) => [
    QUERY_KEYS.tokenDecimals,
    chainId,
    tokenAddress,
  ],
  tokenName: (
    tokenAddress: Address | 'native',
    chainId: string
  ) => [
    QUERY_KEYS.tokenName,
    chainId,
    tokenAddress,
  ],
  tokenSymbol: (
    tokenAddress: Address | 'native',
    chainId: string
  ) => [
    QUERY_KEYS.tokenSymbol,
    chainId,
    tokenAddress,
  ],
  tokenPublicBalance: (
    tokenAddress: Address | 'native',
    chainId: string,
    walletAddress: Address
  ) => [
    QUERY_KEYS.tokenPublicBalance,
    tokenAddress,
    chainId,
    walletAddress,
  ],
  tokenShieldedBalance: (
    tokenAddress: Address | 'native',
    chainId: string,
    walletAddress: Address
  ) => [
    QUERY_KEYS.tokenShieldedBalance,
    tokenAddress,
    chainId,
    walletAddress,
  ],
  shielderPrivateKey: (
    walletAddress: Address,
    networkEnvironment: NetworkEnvironment
  ) => [
    QUERY_KEYS.shielderPrivateKey,
    networkEnvironment,
    walletAddress,
  ],
  wasmCryptoClient: () => [
    QUERY_KEYS.wasmCryptoClient,
  ],
};

export default getQueryKey;
