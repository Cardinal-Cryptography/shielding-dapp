import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { useAccount, usePublicClient, useSendTransaction, useWalletClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import { useToast } from 'src/domains/misc/components/Toast';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import { getWalletErrorName, handleWalletError } from 'src/domains/shielder/utils/walletErrors';

import useShielderClient from './useShielderClient';

export const useShield = () => {
  const { data: shielderClient } = useShielderClient();
  const { address: walletAddress, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { sendTransactionAsync } = useSendTransaction();
  const queryClient = useQueryClient();
  const chainConfig = useChain();
  const { showToast } = useToast();

  const sendTransactionWithToast = async (params: Parameters<typeof sendTransactionAsync>[0]) => {
    const toast = showToast({
      status: 'inProgress',
      title: 'Transaction pending',
      subtitle: 'Waiting to be signed by user.',
      ttlMs: Infinity,
    });

    const timeoutId = setTimeout(() => {
      toast.updateToast({
        subtitle: 'Still waiting? Make sure you signed the transaction from your wallet.',
      });
    }, 10_000);

    try {
      return await sendTransactionAsync(params);
    } catch (error) {
      return handleWalletError(error);
    } finally {
      clearTimeout(timeoutId);
      toast.dismissToast();
    }
  };

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
        sendTransactionWithToast,
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

      const knowErrorName = getWalletErrorName(error);

      switch (knowErrorName) {
        case 'USER_REJECTED_REQUEST':
          showToast({
            status: 'error',
            title: 'Transaction rejected',
            subtitle: 'Transaction has been rejected in the wallet',
          });
          break;

        case 'LOCKED_OR_UNAUTHORIZED':
          showToast({
            status: 'error',
            title: 'Transaction not initiated',
            subtitle: 'Make sure your wallet is unlocked and your account is authorized.',
          });
          break;

        default:
          showToast({
            status: 'error',
            title: 'Shielding failed',
          });
      }
    },
  });

  return {
    shield,
    isShielding,
    ...meta,
  };
};

export default useShield;
