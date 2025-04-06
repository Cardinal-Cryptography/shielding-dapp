import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount,useSendTransaction } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';

import useShielderClient from './useShielderClient';

export const useShield = () => {
  const { data: shielderClient } = useShielderClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { address: walletAddress, chainId } = useAccount();
  const queryClient = useQueryClient();

  const { mutateAsync: shield, isPending: isShielding, ...meta } = useMutation({
    mutationFn: async ({ token, amount }: { token: Token, amount: bigint }) => {
      if (!shielderClient) throw new Error('Shielder is not ready');
      if (!walletAddress) throw new Error('Address is not available');

      const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);

      await shielderClient.shield(
        sdkToken,
        amount,
        async params => await sendTransactionAsync(params),
        walletAddress
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
      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenPublicBalance('native', chainId, walletAddress),
      });
    },
    onError: error => {
      if (!walletAddress || !chainId) return;

      console.error('Shielding failed:', error);
      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenPublicBalance('native', chainId, walletAddress),
      });
    },
  });

  return {
    shield,
    isShielding,
    ...meta,
  };
};

export default useShield;
