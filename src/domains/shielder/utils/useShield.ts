import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { useAccount, usePublicClient, useSendTransaction, useWalletClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';

import useShielderClient from './useShielderClient';

export const useShield = () => {
  const { data: shielderClient } = useShielderClient();
  const { address: walletAddress, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { sendTransactionAsync } = useSendTransaction();
  const queryClient = useQueryClient();
  const chainConfig = useChain();

  const { mutateAsync: shield, isPending: isShielding, ...meta } = useMutation({
    mutationFn: async ({ token, amount }: { token: Token, amount: bigint, onSuccess?: () => void }) => {
      if (!shielderClient) throw new Error('Shielder is not ready');
      if (!walletAddress) throw new Error('Address is not available');

      const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);

      if (!token.isNative) {
        if (!publicClient) throw new Error('Public client is not ready');
        if (!walletClient) throw new Error('Wallet client is not ready');
        if (!chainConfig?.shielderConfig) throw new Error('Shielder is not configured for this chain.');

        const allowance = await publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [walletAddress, chainConfig.shielderConfig.shielderContractAddress],
        });

        if (allowance < amount) {
          await walletClient.writeContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'approve',
            args: [chainConfig.shielderConfig.shielderContractAddress, amount],
          });
        }
      }

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
        queryKey: getQueryKey.tokenShieldedBalance(tokenAddress, chainId.toString(), walletAddress),
      });
      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenPublicBalance(tokenAddress, chainId.toString(), walletAddress),
      });
      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenPublicBalance('native', chainId.toString(), walletAddress),
      });
    },
    onError: error => {
      console.error('Shielding failed:', error);
      if (!walletAddress || !chainId) return;
      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenPublicBalance('native', chainId.toString(), walletAddress),
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
