import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { estimateFeesPerGas } from 'viem/actions';
import { useAccount, usePublicClient, useSendTransaction } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import getQueryKey from 'src/domains/misc/utils/getQueryKey.ts';
import isPresent from 'src/domains/misc/utils/isPresent';

import useShielderClient from './useShielderClient';

// Temporary hardcoded for now since chain-specific gas limit API is not available.
// Used to estimate max shieldable amount: max_amount = token_balance - (gas_price * gas_limit)
const SHIELD_ACTION_GAS_LIMIT = 2_400_000n;

export const useWithdraw = () => {
  const { data: shielderClient } = useShielderClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { address: walletAddress, chainId } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const { data: { maxFeePerGas, gas } = {}} = useQuery({
    queryKey: walletAddress ? getQueryKey.estimateFeesPerGas(walletAddress) : [],
    queryFn: !publicClient ?
      skipToken :
      async () => {
        const { maxFeePerGas } = await estimateFeesPerGas(publicClient);
        return { maxFeePerGas, gas: SHIELD_ACTION_GAS_LIMIT };
      },
  });

  const transactionFee =
      isPresent(maxFeePerGas) && isPresent(gas) ? maxFeePerGas * gas : undefined;

  const { mutateAsync: withdraw, isPending: isWithdrawing, ...meta } = useMutation({
    mutationFn: async ({
      token,
      amount,
      addressTo,
      useManualWithdraw = false,
    }: {
      token: Token,
      amount: bigint,
      addressTo: `0x${string}`,
      useManualWithdraw?: boolean,
    }) => {
      if (!shielderClient) throw new Error('Shielder client not available');
      if (!walletAddress) throw new Error('Wallet address not available');

      const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);

      if (useManualWithdraw) {
        if (!transactionFee) throw new Error('Transaction fees not available');

        await shielderClient.withdrawManual(
          sdkToken,
          amount,
          addressTo,
          async params => await sendTransactionAsync(params),
          walletAddress
        );
      } else {
        const fees = await shielderClient.getWithdrawFees();

        await shielderClient.withdraw(
          sdkToken,
          amount + fees.totalFee,
          fees.totalFee,
          addressTo,
          0n
        );
      }
    },
    onSuccess: (_, { token }) => {
      if (!walletAddress || !chainId) return;

      const tokenAddress = token.isNative ? 'native' : token.address;

      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenShieldedBalance(tokenAddress, chainId, walletAddress),
      });

      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenPublicBalance(tokenAddress, chainId, walletAddress),
      });
    },
    onError: error => {
      console.error('Withdraw failed:', error);
    },
  });

  return {
    withdraw,
    isWithdrawing,
    ...meta,
  };
};

export default useWithdraw;
