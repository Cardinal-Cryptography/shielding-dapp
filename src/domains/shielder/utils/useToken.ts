import { skipToken, useQuery } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import { useShielderStore } from 'src/domains/shielder/stores/shielder';
import tokenToSdkToken from 'src/domains/shielder/utils/tokenToSdkToken';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

type QueryNames = 'decimals' | 'name' | 'symbol' | 'publicBalance' | 'shieldedBalance';

const useToken = (token: Token, include?: QueryNames[]) => {
  const { address: accountAddress } = useAccount();
  const chainConfig = useChain();
  const publicClient = usePublicClient();
  const { selectedAccountType } = useShielderStore();

  const { data: shielderClient } = useShielderClient();

  const tokenAddress = token.isNative ? 'native' : token.address;

  const decimalsQuery = useQuery({
    enabled: !include || include.includes('decimals'),
    queryKey: getQueryKey.tokenDecimals(tokenAddress),
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
    enabled: !include || include.includes('name'),
    queryKey: getQueryKey.tokenName(tokenAddress),
    queryFn: token.isNative ?
      () => chainConfig?.nativeCurrency.name :
      publicClient ?
        () =>
          publicClient.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'name',
          }) :
        skipToken,
  });

  const symbolQuery = useQuery({
    enabled: !include || include.includes('symbol'),
    queryKey: getQueryKey.tokenSymbol(tokenAddress),
    queryFn: token.isNative ?
      () => chainConfig?.nativeCurrency.symbol :
      publicClient ?
        () =>
          publicClient.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'symbol',
          }) :
        skipToken,
  });

  const publicBalanceQuery = useQuery({
    enabled: selectedAccountType === 'public' && (!include || include.includes('publicBalance')),
    queryKey: accountAddress && chainConfig?.id ?
      getQueryKey.tokenPublicBalance(tokenAddress, chainConfig.id, accountAddress) : [],
    queryFn: publicClient && accountAddress ?
      token.isNative ? () => publicClient.getBalance({ address: accountAddress }) :
      () =>
        publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [accountAddress],
        }) :
      skipToken,
  });

  const shieldedBalanceQuery = useQuery({
    enabled: selectedAccountType === 'shielded' && (!include || include.includes('shieldedBalance')),
    queryKey: accountAddress && chainConfig?.id ?
      getQueryKey.tokenShieldedBalance(tokenAddress, chainConfig.id, accountAddress) : [],
    queryFn: shielderClient ?
      () => shielderClient.accountState(tokenToSdkToken(token)).then(res => res?.balance ?? 0n):
      skipToken,
  });

  return { nameQuery, symbolQuery, decimalsQuery, publicBalanceQuery, shieldedBalanceQuery };
};

export default useToken;
