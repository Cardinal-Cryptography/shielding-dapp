import { useAppKitNetwork } from '@reown/appkit/react';
import { useQueries } from '@tanstack/react-query';
import { objectEntries } from 'tsafe';
import { erc20Abi } from 'viem';
import { usePublicClient } from 'wagmi';

import getChainConfigById from 'src/domains/chains/utils/getChainConfigById.ts';
import { useTokensBalance } from 'src/domains/tokens/utils/useTokenBalance.ts';

const useTokens = () => {
  const { chainId } = useAppKitNetwork();
  const chainConfig = chainId && getChainConfigById(chainId);
  const publicClient = usePublicClient();

  const nonNativeTokens = chainConfig ?
    objectEntries(chainConfig.whitelistedTokens).map(([address, token]) => ({
      ...token,
      address,
      isNative: false as const,
      chain: chainConfig.key,
      name: undefined,
      symbol: undefined,
      decimals: undefined,
      usdPrice: 0,
    })) :
    [];

  const nativeToken = chainConfig ?
    [
      {
        address: undefined,
        isNative: true as const,
        chain: chainConfig.key,
        name: chainConfig.nativeCurrency.name,
        symbol: chainConfig.nativeCurrency.symbol,
        decimals: chainConfig.nativeCurrency.decimals,
        icon: chainConfig.NativeTokenIcon,
        usdPrice: 0,
      },
    ] :
    [];

  const tokens = [...nativeToken, ...nonNativeTokens];
  const balanceQueries = useTokensBalance({ tokens });

  const decimalsQueries = useQueries({
    queries: nonNativeTokens.map(({ address }) => ({
      queryKey: ['tokenDecimals', address],
      queryFn: async () => {
        if (!publicClient) throw new Error('Public client not available');
        return publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'decimals',
        });
      },
    })),
  });

  const nameQueries = useQueries({
    queries: nonNativeTokens.map(({ address }) => ({
      queryKey: ['tokenName', address],
      queryFn: async () => {
        if (!publicClient) throw new Error('Public client not available');
        return publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'name',
        });
      },
    })),
  });

  const symbolQueries = useQueries({
    queries: nonNativeTokens.map(({ address }) => ({
      queryKey: ['tokenSymbol', address],
      queryFn: async () => {
        if (!publicClient) throw new Error('Public client not available');
        return publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'symbol',
        });
      },
    })),
  });

  const isLoading =
        decimalsQueries.some(q => q.isLoading) ||
        nameQueries.some(q => q.isLoading) ||
        symbolQueries.some(q => q.isLoading) ||
        balanceQueries.isLoading;

  const tokensWithMetadata = tokens.map((token, index) => {
    const address = token.address;

    if (!address) {
      return {
        ...token,
        balance: {
          atomic: balanceQueries.data?.[index],
        },
      };
    }

    return {
      ...token,
      decimals: decimalsQueries[index]?.data,
      name: nameQueries[index]?.data,
      symbol: symbolQueries[index]?.data,
      balance: {
        atomic: balanceQueries.data?.[index],
      },
    };
  });

  return {
    tokens: tokensWithMetadata,
    isLoading,
  };
};

export default useTokens;
