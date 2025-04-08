import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { Token } from 'src/domains/chains/types/misc';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

type Props = {
  walletAddress: Address | undefined,
  token: Token,
};

const useTransactionFees = ({ walletAddress, token }: Props) => {
  const { data: shielderClient } = useShielderClient();
  const { data } = useQuery({
    queryKey: walletAddress ? getQueryKey.estimateFeesPerGas(walletAddress) : [],
    queryFn: !shielderClient ?
      skipToken :
      async () => {
        const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);

        return await shielderClient.getWithdrawFees(sdkToken, 0n);
      },
  });

  return data;
};

export default useTransactionFees;
