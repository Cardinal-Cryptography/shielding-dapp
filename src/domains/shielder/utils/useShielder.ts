import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { estimateFeesPerGas } from 'viem/actions';
import { useAccount, usePublicClient, useSendTransaction } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import isPresent from 'src/domains/misc/utils/isPresent';

import useShielderClient from './useShielderClient';
const SHIELD_ACTION_GAS_LIMIT = 2_400_000n;

export const useShielder = () => {
  const { data: shielderClient } = useShielderClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { address: walletAddress, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [isShielding, setIsShielding] = useState(false);
  const queryClient = useQueryClient();

  const [isUnShielding, setIsUnShielding] = useState(false);

  const { data: { maxFeePerGas, gas } = {}} = useQuery({
    queryKey: ['shieldActionFees', chainId],
    queryFn: !publicClient ? skipToken : async () => {
      const { maxFeePerGas } = await estimateFeesPerGas(publicClient);
      const gas = SHIELD_ACTION_GAS_LIMIT;

      return { maxFeePerGas, gas };
    },
  });
  const transactionFee = isPresent(maxFeePerGas) && isPresent(gas) ? maxFeePerGas * gas : undefined;

  const unShield = async (
    token: Token,
    amount: bigint,
    addressTo: `0x${string}`,
    useManualWithdraw = false,
  ) => {
    if (!shielderClient) {
      throw new Error('Shielder client not available');
    }

    if(!walletAddress) {
      throw new Error('Wallet address not available');
    }
    setIsUnShielding(true);
    try {
      // Determine which token to use
      const sdkToken = token.isNative ?
        nativeToken() :
        erc20Token(token.address);

      if (useManualWithdraw) {
        if(!transactionFee) {
          throw new Error('Transaction fees not available');
        }

        await shielderClient.withdrawManual(
          sdkToken,
          amount,
          addressTo,
          async params => {
            const txHash = await sendTransactionAsync({
              ...params,
            }).catch((e: unknown) => {
              throw e;
            });
            return txHash;
          },
          walletAddress,
        );
      } else {
        const fees = await shielderClient.getWithdrawFees();
        // Use regular withdraw
        await shielderClient.withdraw(
          sdkToken,
          amount + fees.totalFee,
          fees.totalFee,
          addressTo,
          0n,
        );
      }
      void queryClient.invalidateQueries({ queryKey: ['combinedBalances'] });
    } catch (e) {
      console.error(e);
      setIsUnShielding(false);
      throw e;
    }
    setIsUnShielding(false);
  };

  const shield = async (token: Token, amount: bigint) => {
    if (!shielderClient) {
      throw new Error('Shielder is not ready');
    }
    if (!walletAddress) {
      throw new Error('Address is not available');
    }
    if(!transactionFee) {
      throw new Error('Transaction fees not available');
    }

    if(amount < transactionFee * 2n) {
      throw new Error('Amount is too low');
    }
    setIsShielding(true);
    try {
      const sdkToken = token.isNative ? nativeToken() : erc20Token(token.address);
      await shielderClient.shield(
        sdkToken,
        amount - (transactionFee * 2n),
        async params => {
          const txHash = await sendTransactionAsync(params).catch((e: unknown) => {
            throw e;
          });
          return txHash;
        },
        walletAddress
      );

    } catch (e) {
      console.error(e);
      setIsShielding(false);
    }
    setIsShielding(false);
    void queryClient.invalidateQueries({ queryKey: ['combinedBalances'] });
  };

  return {
    shield,
    isShielding,
    unShield,
    isUnShielding,
  };
};

export default useShielder;
