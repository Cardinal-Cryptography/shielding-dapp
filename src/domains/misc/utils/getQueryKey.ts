import type { Address } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

export const QUERY_KEYS = {
  wasmCryptoClient: 'wasm-crypto-client',
  shielderClient: 'shielder-client',
  shielderPrivateKey: 'shielderPrivateKey',
  tokenName: 'token-name',
  tokenSymbol: 'token-symbol',
  tokenDecimals: 'token-decimals',
  tokenPublicBalance: 'token-public-balance',
  tokenShieldedBalance: 'token-shielded-balance',
  allowanceCheck: 'allowance-check',
  allowanceFeeEstimate: 'allowance-fee-estimate',
  shieldingFeesEstimate: 'shielding-fees-estimate',
  sendingFeesEstimate: 'sending-fees-estimate',
  shielderTransactions: 'shielder-transactions',
} as const;

export const MUTATION_KEYS = {
  shield: 'shield',
  withdraw: 'withdraw',
} as const;

const getQueryKey = {
  sendingFees: (walletAddress: Address, chainId: string) => [
    QUERY_KEYS.sendingFeesEstimate,
    walletAddress,
    chainId,
  ],
  shieldingFees: (chainId: string, tokenType: 'native' | 'erc20') => [
    QUERY_KEYS.shieldingFeesEstimate,
    chainId,
    tokenType,
  ],
  allowanceCheck: (tokenAddress: Address, chainId: string, walletAddress: Address, amount: string) => [
    QUERY_KEYS.allowanceCheck,
    tokenAddress,
    chainId,
    walletAddress,
    amount,
  ],
  allowanceFeeEstimate: (tokenAddress: Address, chainId: string, walletAddress: Address, amount: string) => [
    QUERY_KEYS.allowanceFeeEstimate,
    tokenAddress,
    chainId,
    walletAddress,
    amount,
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
