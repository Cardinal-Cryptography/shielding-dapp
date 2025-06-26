import { skipToken, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import useEstimateAllowanceFee from 'src/domains/shielder/utils/useEstimateAllowanceFee';

export type FeeItem = {
  type: 'network' | 'relayer' | 'allowance',
  amount: bigint,
  token: string,
};

const feeEstimationSchema = z.object({
  native_new_account_gas: z.string(),
  native_deposit_gas: z.string(),
  erc20_new_account_gas: z.string(),
  erc20_deposit_gas: z.string(),
  gas_price_native: z.string(),
  update_timestamp: z.number(),
});

export type FeeEstimation = z.infer<typeof feeEstimationSchema>;

type Props = {
  token: Token,
  amount?: bigint,
  disabled?: boolean,
};

const useShieldingFees = ({ token, amount, disabled }: Props) => {
  const chainConfig = useChain();
  const shieldingFeeEstimatorUrl = chainConfig?.shielderConfig?.shieldingFeeEstimatorUrl;
  const tokenType = token.isNative ? 'native' : 'erc20';

  const {
    data: shieldingFees,
    error: shieldingFeesError,
    isLoading: areShieldingFeesLoading,
  } = useQuery({
    queryKey: chainConfig && shieldingFeeEstimatorUrl && !disabled ?
      getQueryKey.shieldingFees(chainConfig.id.toString(), tokenType) : [],
    queryFn: !shieldingFeeEstimatorUrl || disabled ?
      skipToken :
      async (): Promise<FeeEstimation> => {
        const response = await fetch(shieldingFeeEstimatorUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch fees: ${response.status} ${response.statusText}`);
        }

        return feeEstimationSchema.parse(await response.json());
      },
    enabled: !!shieldingFeeEstimatorUrl && !disabled,
  });

  const { data: allowanceFeeEstimate, isLoading: isAllowanceFeeLoading } = useEstimateAllowanceFee({
    token,
    amount: amount ?? 0n,
    disabled,
  });

  const fees: FeeItem[] | undefined = useMemo(() => {
    if (!shieldingFees || !chainConfig) {
      return undefined;
    }

    const gasPrice = BigInt(shieldingFees.gas_price_native);
    const gasAmount = BigInt(token.isNative ?
      shieldingFees.native_deposit_gas :
      shieldingFees.erc20_deposit_gas
    );
    const networkFeeAmount = gasAmount * gasPrice;

    const networkFee: FeeItem = {
      type: 'network',
      amount: networkFeeAmount,
      token: 'native',
    };

    if (!token.isNative && allowanceFeeEstimate && allowanceFeeEstimate > 0n) {
      const allowanceFee: FeeItem = {
        type: 'allowance',
        amount: allowanceFeeEstimate,
        token: 'native',
      };
      return [networkFee, allowanceFee];
    }

    return [networkFee];
  }, [shieldingFees, chainConfig, token, allowanceFeeEstimate]);

  const isLoading = areShieldingFeesLoading || isAllowanceFeeLoading;

  return {
    fees,
    isLoading,
    error: shieldingFeesError,
  };
};

export default useShieldingFees;
