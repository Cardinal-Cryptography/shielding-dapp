import { erc20Token, nativeToken, Token as SDKToken } from '@cardinal-cryptography/shielder-sdk';
import { useAppKitNetwork } from '@reown/appkit/react';
import { useQueries } from '@tanstack/react-query';
import { Address, erc20Abi } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import getQueryKey from 'src/domains/misc/utils/getQueryKey.ts';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

const tokenToSdkToken = (token: Token): SDKToken =>
  token.isNative ? nativeToken() : erc20Token(token.address);

type BalanceMap = Record<Address | 'native', bigint>;

const useTokensBalance = ({ tokens }: { tokens: Token[] }) => {
  const { address: walletAddress } = useAccount();
  const { data: shielderClient } = useShielderClient();
  const publicClient = usePublicClient();
  const { chainId } = useAppKitNetwork();

  const isQueryDisabled = !walletAddress || !publicClient || !shielderClient || !chainId;

  const publicBalancesQueries = useQueries({
    queries: isQueryDisabled ? [] : tokens.map(token => ({
      queryKey: getQueryKey.tokenPublicBalance(token.isNative ? 'native' : token.address, chainId, walletAddress),
      queryFn: async () => {
        return token.isNative ?
          publicClient.getBalance({ address: walletAddress }) :
          publicClient.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [walletAddress],
          });
      },
    })),
    combine: results => ({
      data: results.reduce((acc, curr, i) => {

        return { ...acc, [tokens[i].isNative ? 'native' : tokens[i].address]: curr.data };
      }, {} as BalanceMap),
      isLoading: results.some(result => result.isLoading),
    }),
  });

  const shieldedBalancesQueries = useQueries({
    queries: isQueryDisabled ? [] : tokens.map(token => ({
      queryKey: getQueryKey.tokenShieldedBalance(token.isNative ? 'native' : token.address, chainId, walletAddress),
      queryFn: () => shielderClient.accountState(tokenToSdkToken(token)),
    })),
    combine: results => ({
      data: results.reduce((acc, curr, i) => {

        return { ...acc, [tokens[i].isNative ? 'native' : tokens[i].address]: curr.data?.balance ?? 0n };
      }, {} as BalanceMap),
      isLoading: results.some(result => result.isLoading),
    }),
  });

  return { publicBalancesQueries, shieldedBalancesQueries };
};

export default useTokensBalance;
