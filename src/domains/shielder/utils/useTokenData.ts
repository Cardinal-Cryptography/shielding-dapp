import { skipToken, useQuery } from '@tanstack/react-query';
import { Writable } from 'utility-types';
import { erc20Abi } from 'viem';
import { arbitrum } from 'viem/chains';
import { useAccount, usePublicClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import usePublicBalance from 'src/domains/chains/utils/usePublicBalance';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import useShielderStore from 'src/domains/shielder/stores/shielder';
import tokenToShielderToken from 'src/domains/shielder/utils/tokenToShielderToken';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

const queryNames = ['decimals', 'name', 'symbol', 'publicBalance', 'shieldedBalance'] as const;
type QueryNames = typeof queryNames[number];

const useTokenData = (token: Token, include: QueryNames[] = queryNames as Writable<typeof queryNames>) => {
  const { address: accountAddress } = useAccount();
  const chainConfig = useChain();
  const publicClient = usePublicClient();
  const { selectedAccountType } = useShielderStore();

  const { data: shielderClient } = useShielderClient();

  const tokenIdentifier = token.isNative ? 'native' : token.address;

  const decimalsQuery = useQuery({
    enabled: include.includes('decimals'),
    queryKey: getQueryKey.tokenDecimals(tokenIdentifier),
    queryFn: token.isNative ?
      () => chainConfig?.nativeCurrency.decimals :
      publicClient ?
        () =>
          publicClient.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'decimals',
          }) :
        skipToken,
  });

  const nameQuery = useQuery({
    enabled: include.includes('name'),
    queryKey: getQueryKey.tokenName(tokenIdentifier),
    queryFn: token.isNative ?
      () => chainConfig?.nativeCurrency.name :
      publicClient ?
        withArbitrumUsdtPatch(token.address, chainConfig?.id, () => publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: 'name',
        })) :
        skipToken,
  });

  const symbolQuery = useQuery({
    enabled: include.includes('symbol'),
    queryKey: getQueryKey.tokenSymbol(tokenIdentifier),
    queryFn: token.isNative ?
      () => chainConfig?.nativeCurrency.symbol :
      publicClient ?
        withArbitrumUsdtPatch(token.address, chainConfig?.id, () => publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: 'symbol',
        })) :
        skipToken,
  });

  const publicBalanceQuery = usePublicBalance({
    token,
    accountAddress,
    options: {
      enabled: selectedAccountType === 'public' && include.includes('publicBalance'),
    },
  });

  const shieldedBalanceQuery = useQuery({
    enabled: selectedAccountType === 'shielded' && include.includes('shieldedBalance'),
    queryKey: accountAddress && chainConfig?.id ?
      getQueryKey.tokenShieldedBalance(tokenIdentifier, chainConfig.id, accountAddress) : [],
    queryFn: shielderClient ?
      () => shielderClient.accountState(tokenToShielderToken(token)).then(res => res?.balance ?? 0n):
      skipToken,
  });

  return { nameQuery, symbolQuery, decimalsQuery, publicBalanceQuery, shieldedBalanceQuery };
};

export default useTokenData;

const withArbitrumUsdtPatch = (
  tokenAddress: string,
  chainId: number | undefined,
  fn: () => Promise<string>
) => async () => {
  if (
    chainId === arbitrum.id &&
    tokenAddress.toLowerCase() === '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
  ) {
    return 'USDT';
  }

  return fn();
};
