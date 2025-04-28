import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

type Props = {
  walletAddress: Address | undefined,
  token: Token,
};

const useShielderFees = ({ walletAddress, token }: Props) => {
  const chainConfig = useChain();
  const { data: shielderClient } = useShielderClient();
  const { data } = useQuery(chainConfig ? {
    queryKey: walletAddress ? getQueryKey.shielderFees(walletAddress, chainConfig.id.toString()) : [],
    queryFn: !shielderClient ?
      skipToken :
      async () => {
        const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);

        return await shielderClient.getWithdrawFees(sdkToken, 0n);
      },
  } : { queryKey: [], queryFn: skipToken });

  return data;
};

export default useShielderFees;
