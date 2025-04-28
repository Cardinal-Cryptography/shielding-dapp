import type { Address } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

const getQueryKey = {
  shielderFees: (walletAddress: Address, chainId: string) => ['shielderFees', walletAddress, chainId] ,
  shielderClient: (chainId: number, shielderPrivateKey: Address) => [
    'shielder-client',
    chainId,
    shielderPrivateKey,
  ] ,
  shielderTransactions: (accountAddress: Address, chainId: number) => [
    'shielder-transactions',
    accountAddress,
    chainId,
  ] ,
  tokenDecimals: (tokenAddress: Address | 'native', chainId: string | number) => ['token-decimals', chainId, tokenAddress],
  tokenName: (tokenAddress: Address | 'native', chainId: string | number) => ['token-name', chainId, tokenAddress] ,
  tokenSymbol: (tokenAddress: Address | 'native', chainId: string | number) => ['token-symbol', chainId, tokenAddress] ,
  tokenPublicBalance: (tokenAddress: Address | 'native', chainId: string | number, walletAddress: Address) => [
    'token-public-balance',
    tokenAddress,
    chainId,
    walletAddress,
  ] ,
  tokenShieldedBalance: (tokenAddress: Address | 'native', chainId: string | number, walletAddress: Address) => [
    'token-shielded-balance',
    tokenAddress,
    chainId,
    walletAddress,
  ] ,
  shielderPrivateKey: (walletAddress: Address, networkEnvironment: NetworkEnvironment) => ['shielderPrivateKey', networkEnvironment, walletAddress] ,
  wasmCryptoClient: () => ['wasm-crypto-client'] ,
};

export default getQueryKey;
