import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';

import { useWallet } from 'src/domains/chains/components/WalletProvider.tsx';
import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import { FeeItem } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useEstimateAllowanceFee from 'src/domains/shielder/utils/useEstimateAllowanceFee';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

const FeeEstimationSchema = z.object({
  native_new_account_gas: z.string(),
  native_deposit_gas: z.string(),
  erc20_new_account_gas: z.string(),
  erc20_deposit_gas: z.string(),
  gas_price_native: z.string(),
  update_timestamp: z.number(),
});

export type FeeEstimation = z.infer<typeof FeeEstimationSchema>;

export type FeeStructure = FeeItem[];

type Props = {
  operation: 'shield' | 'send',
  token: Token,
  amount?: bigint,
};

const useShielderFees = ({ token, operation, amount }: Props) => {
  const chainConfig = useChain();
  const { data: shielderClient } = useShielderClient();
  const { address: walletAddress } = useWallet();

  const shieldingFeeEstimatorUrl = chainConfig?.shielderConfig?.shieldingFeeEstimatorUrl;
  const tokenType = token.isNative ? 'native' : 'erc20';

  const {
    data: shieldingFees,
    error: shieldingFeesError,
    isLoading: areShieldingFeesLoading,
  } = useQuery({
    queryKey: chainConfig && shieldingFeeEstimatorUrl && operation === 'shield' ?
      getQueryKey.shieldingFees(chainConfig.id.toString(), tokenType) : [],
    queryFn: !shieldingFeeEstimatorUrl || operation !== 'shield' ?
      skipToken :
      async (): Promise<FeeEstimation> => {
        const response = await fetch(shieldingFeeEstimatorUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch fees: ${response.status} ${response.statusText}`);
        }

        const rawData: unknown = await response.json();
        return FeeEstimationSchema.parse(rawData);
      },
    enabled: !!shieldingFeeEstimatorUrl && operation === 'shield',
  });

  const {
    data: withdrawingFees,
    error: withdrawingFeesError,
    isLoading: areWithdrawingFeesLoading,
  } = useQuery({
    queryKey: chainConfig && walletAddress && operation === 'send' ?
      getQueryKey.sendingFees(walletAddress, chainConfig.id.toString()) : [],
    queryFn: !shielderClient || operation !== 'send' ?
      skipToken :
      async () => {
        const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);
        return await shielderClient.getWithdrawFees(sdkToken, 0n);
      },
    enabled: !!shielderClient && !!chainConfig && !!walletAddress && operation === 'send',
  });

  const { data: allowanceFeeEstimate } = useEstimateAllowanceFee({
    token,
    amount: amount ?? 0n,
    enabled: operation === 'shield',
  });

  const fees: FeeStructure | undefined = useMemo(() => {
    if (operation === 'shield' && shieldingFees && chainConfig) {
      const gasPrice = BigInt(shieldingFees.gas_price_native);
      const gasAmount = BigInt(token.isNative ?
        shieldingFees.native_new_account_gas :
        shieldingFees.erc20_new_account_gas
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
    }

    if (operation === 'send' && withdrawingFees) {
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
    }

    return undefined;
  }, [operation, shieldingFees, withdrawingFees, chainConfig, token, allowanceFeeEstimate]);

  const totalFee = fees?.reduce((total, fee) => total + fee.amount, 0n);

  const isLoading = operation === 'shield' ?
    areShieldingFeesLoading :
    areWithdrawingFeesLoading;
  const error = operation === 'shield' ?
    shieldingFeesError :
    withdrawingFeesError;

  return {
    fees,
    totalFee,
    isLoading,
    error,
  };
};

export default useShielderFees;
