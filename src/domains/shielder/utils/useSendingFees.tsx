import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useWallet } from 'src/domains/chains/components/WalletProvider.tsx';
import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

export type FeeItem = {
  type: 'network' | 'relayer' | 'allowance',
  amount: bigint,
  token: string,
};

type Props = {
  token: Token,
  disabled?: boolean,
};

const useSendingFees = ({ token, disabled }: Props) => {
  const chainConfig = useChain();
  const { data: shielderClient } = useShielderClient();
  const { address: walletAddress } = useWallet();

  const {
    data: withdrawingFees,
    error: withdrawingFeesError,
    isLoading: areWithdrawingFeesLoading,
  } = useQuery({
    queryKey: chainConfig && walletAddress && !disabled ?
      getQueryKey.sendingFees(walletAddress, chainConfig.id.toString()) : [],
    queryFn: !shielderClient || disabled ?
      skipToken :
      async () => {
        const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);
        return await shielderClient.getWithdrawFees(sdkToken, 0n);
      },
    enabled: !!shielderClient && !!chainConfig && !!walletAddress && !disabled,
  });

  const fees: FeeItem[] | undefined = useMemo(() => {
    if (!withdrawingFees) {
      return undefined;
    }

    const { fee_details } = withdrawingFees;
    const hasCommission = fee_details.commission_fee_token > 0n;

    const networkFee: FeeItem = {
      type: 'network',
      amount: fee_details.gas_cost_fee_token,
      token: 'native',
    };

    if (hasCommission) {
      const relayerFee: FeeItem = {
        type: 'relayer',
        amount: fee_details.commission_fee_token,
        token: 'native',
      };
      return [networkFee, relayerFee];
    }

    return [networkFee];
  }, [withdrawingFees]);

  return {
    fees,
    isLoading: areWithdrawingFeesLoading,
    error: withdrawingFeesError,
  };
};

export default useSendingFees;
