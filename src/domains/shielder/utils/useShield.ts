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

export const useShield = () => {
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

  const { mutateAsync: shield, isPending: isShielding, ...meta } = useMutation({
    mutationFn: async ({ token, amount }: { token: Token, amount: bigint }) => {
      if (!shielderClient) throw new Error('Shielder is not ready');
      if (!walletAddress) throw new Error('Address is not available');
      if (!transactionFee) throw new Error('Transaction fees not available');
      if (amount < transactionFee * 2n) throw new Error('Amount is too low');

      const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);

      await shielderClient.shield(
        sdkToken,
        amount - transactionFee * 2n,
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
    },
    onError: error => {
      console.error('Shielding failed:', error);
    },
  });

  return {
    shield,
    isShielding,
    ...meta,
  };
};

export default useShield;
