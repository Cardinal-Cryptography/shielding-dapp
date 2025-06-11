import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { v4 } from 'uuid';
import { erc20Abi } from 'viem';
import { useAccount, usePublicClient, useSendTransaction, useWalletClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import { useToast } from 'src/domains/misc/components/Toast';
import getQueryKey, { MUTATION_KEYS } from 'src/domains/misc/utils/getQueryKey';
import { Fee } from 'src/domains/shielder/stores/getShielderIndexedDB';
import { useActivityHistory } from 'src/domains/shielder/utils/useActivityHistory';
import useActivityModal from 'src/domains/shielder/utils/useActivityModal';
import { getWalletErrorName, handleWalletError } from 'src/domains/shielder/utils/walletErrors';
import vars from 'src/domains/styling/utils/vars';

import useShielderClient from './useShielderClient';

const useShield = () => {
  const { data: shielderClient } = useShielderClient();
  const { address: walletAddress, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { sendTransactionAsync } = useSendTransaction();
  const queryClient = useQueryClient();
  const chainConfig = useChain();
  const { showToast } = useToast();
  const { openTransactionModal } = useActivityModal();
  const { upsertTransaction } = useActivityHistory();

  const sendTransactionWithToast = async (
    params: Parameters<typeof sendTransactionAsync>[0],
    token: Token,
    amount: bigint,
    fee: Fee | undefined
  ) => {
    if(!chainId) throw new Error('chainId is not available');
    if(!walletAddress) throw new Error('walletAddress is not available');

    const localId = v4();

    await upsertTransaction(chainId, {
      token: token.isNative ?
        { type: 'native' } :
        { type: 'erc20', address: token.address },
      type: 'Deposit',
      amount,
      localId,
      status: 'pending',
      fee,
    });

    const toast = showToast({
      status: 'inProgress',
      title: 'Transaction pending',
      subtitle: 'Waiting to be signed by user.',
      body: (
        <DetailsButton
          onClick={() => void openTransactionModal({ localId })}
        >
          See details
        </DetailsButton>
      ),
      ttlMs: Infinity,
    });

    const timeoutId = setTimeout(() => {
      toast.updateToast({
        subtitle: 'Still waiting? Make sure you signed the transaction from your wallet.',
      });
    }, 10_000);

    try {
      const txHash = await sendTransactionAsync(params);
      await upsertTransaction(chainId, {
        localId,
        txHash,
      });
      return txHash;
    } catch (error) {
      await upsertTransaction(chainId, {
        localId,
        status: 'failed',
        completedTimestamp: Date.now(),
      });
      return handleWalletError(error);
    } finally {
      clearTimeout(timeoutId);
      toast.dismissToast();
    }
  };

  const { mutateAsync: shield, isPending: isShielding, ...meta } = useMutation({
    mutationKey: [MUTATION_KEYS.shield],
    mutationFn: async ({
      token,
      amount,
      fee,
    }: {
      token: Token,
      amount: bigint,
      fee: Fee | undefined,
    }) => {
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
        params => sendTransactionWithToast(params, token, amount, fee),
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

const DetailsButton = styled.button`
  color: ${vars('--color-brand-foreground-link-rest')};

  &:hover {
    color: ${vars('--color-brand-foreground-link-hover')};
  }

  &:active {
    color: ${vars('--color-brand-foreground-link-pressed')};
  }
`;
