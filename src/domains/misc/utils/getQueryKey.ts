import type { Address } from 'viem';

const getQueryKey = {
  estimateFeesPerGas: (walletAddress: Address) => ['shieldActionFees', walletAddress] as const,
  shielderClient: (chainId: number, shielderPrivateKey: Address) => [
    'shielder-client',
    chainId,
    shielderPrivateKey,
  ] as const,
  shielderTransactions: (accountAddress: Address, chainId: number) => [
    'shielder-transactions',
    accountAddress,
    chainId,
  ] as const,
  tokenDecimals: (tokenAddress: Address) => ['token-decimals', tokenAddress] as const,
  tokenName: (tokenAddress: Address) => ['token-name', tokenAddress] as const,
  tokenSymbol: (tokenAddress: Address) => ['token-symbol', tokenAddress] as const,
  tokenPublicBalance: (tokenAddress: Address | 'native', chainId: string | number, walletAddress: Address) => [
    'token-public-balance',
    tokenAddress,
    chainId,
    walletAddress,
  ] as const,
  tokenShieldedBalance: (tokenAddress: Address | 'native', chainId: string | number, walletAddress: Address) => [
    'token-shielded-balance',
    tokenAddress,
    chainId,
    walletAddress,
  ] as const,
  wasmCryptoClient: () => ['wasm-crypto-client'] as const,
};

export default getQueryKey;
