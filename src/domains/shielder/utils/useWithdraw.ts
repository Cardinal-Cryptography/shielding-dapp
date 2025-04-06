import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSendTransaction } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';

import useShielderClient from './useShielderClient';

export const useWithdraw = () => {
  const { data: shielderClient } = useShielderClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { address: walletAddress, chainId } = useAccount();
  const queryClient = useQueryClient();

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
