import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import { useToast } from 'src/domains/misc/components/Toast';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import { Fee } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useTransactionDetailsModal from 'src/domains/shielder/utils/useTransactionDetailsModal';
import { useTransactionsHistory } from 'src/domains/shielder/utils/useTransactionsHistory';
import vars from 'src/domains/styling/utils/vars.ts';

import useShielderClient from './useShielderClient';

const useWithdraw = () => {
  const { data: shielderClient } = useShielderClient();
  const { address: walletAddress, chainId } = useAccount();
  const queryClient = useQueryClient();
  const { upsertTransaction } = useTransactionsHistory();
  const { openTransactionModal } = useTransactionDetailsModal();
  const { showToast } = useToast();

  const {
    mutateAsync: withdraw,
    isPending: isWithdrawing,
    ...meta
  } = useMutation({
    mutationFn: async ({
      token,
      amount,
      addressTo,
      fee,
    }: {
      token: Token,
      amount: bigint,
      addressTo: `0x${string}`,
      fee: Fee | undefined,
    }) => {
      if (!shielderClient) throw new Error('Shielder client not available');
      if (!walletAddress) throw new Error('Wallet address not available');
      if (!chainId) throw new Error('Chain id not available');

      const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);
      const fees = await shielderClient.getWithdrawFees(sdkToken, 0n);

      const localId = uuidv4();
      await upsertTransaction(chainId, {
        token: token.isNative ?
          { type: 'native' } :
          { type: 'erc20', address: token.address },
        type: 'Withdraw',
        amount,
        localId,
        status: 'pending',
        submitTimestamp: Date.now(),
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
        const txHash = await shielderClient.withdraw(
          sdkToken,
          amount + fees.fee_details.total_cost_fee_token,
          fees,
          addressTo,
          0n
        );
        await upsertTransaction(chainId, { localId, txHash, status: 'completed' });
        return txHash;
      } catch (error) {
        await upsertTransaction(chainId, {
          localId,
          status: 'failed',
          completedTimestamp: Date.now(),
        });
        throw error;
      } finally {
        clearTimeout(timeoutId);
        toast.dismissToast();
      }
    },

    onSuccess: (_, { token }) => {
      if (!walletAddress || !chainId) return;

      const tokenAddress = token.isNative ? 'native' : token.address;

      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenShieldedBalance(
          tokenAddress,
          chainId.toString(),
          walletAddress
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: getQueryKey.tokenPublicBalance(
          tokenAddress,
          chainId.toString(),
          walletAddress
        ),
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

const DetailsButton = styled.button`
  color: ${vars('--color-brand-foreground-link-rest')};

  &:hover {
    color: ${vars('--color-brand-foreground-link-hover')};
  }

  &:active {
    color: ${vars('--color-brand-foreground-link-pressed')};
  }
`;
