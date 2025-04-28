import { skipToken, useQuery } from '@tanstack/react-query';
import { Address, erc20Abi } from 'viem';
import { usePublicClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';

type Props = {
  token: Token | { isNative: true },
  accountAddress?: Address,
  options?: {
    enabled?: boolean,
  },
};

const usePublicBalance = ({ token, accountAddress, options }: Props) => {
  const chainConfig = useChain();
  const publicClient = usePublicClient();

  const tokenAddress = token.isNative ? 'native' : token.address;

  return useQuery({
    enabled: options?.enabled,
    queryKey: accountAddress && chainConfig?.id ?
      getQueryKey.tokenPublicBalance(tokenAddress, chainConfig.id.toString(), accountAddress) : [],
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
};

export default usePublicBalance;
