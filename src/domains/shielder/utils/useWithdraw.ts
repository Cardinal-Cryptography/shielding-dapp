import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';

import useShielderClient from './useShielderClient';

export const useWithdraw = () => {
  const { data: shielderClient } = useShielderClient();
  const { address: walletAddress, chainId } = useAccount();
  const queryClient = useQueryClient();

  const { mutateAsync: withdraw, isPending: isWithdrawing, ...meta } = useMutation({
    mutationFn: async ({
      token,
      amount,
      addressTo,
    }: {
      token: Token,
      amount: bigint,
      addressTo: `0x${string}`,
    }) => {
      if (!shielderClient) throw new Error('Shielder client not available');
      if (!walletAddress) throw new Error('Wallet address not available');

      const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);

      const fees = await shielderClient.getWithdrawFees(sdkToken, 0n);

      await shielderClient.withdraw(
        sdkToken,
        amount + fees.fee_details.total_cost_fee_token,
        fees,
        addressTo,
        0n
      );
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
