import { skipToken, useQuery } from '@tanstack/react-query';
import { erc20Abi, encodeFunctionData } from 'viem';
import { useEstimateFeesPerGas, useEstimateGas, usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider.tsx';
import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';

type Props = {
  token: Token,
  amount: bigint,
  disabled?: boolean,
};

const useEstimateAllowanceFee = ({ token, amount, disabled }: Props) => {
  const chainConfig = useChain();
  const publicClient = usePublicClient();
  const { address: walletAddress } = useWallet();

  const shouldCheckAllowance = !token.isNative && amount > 0n && !disabled;

  const { data: needsApproval } = useQuery({
    queryKey: chainConfig && walletAddress && shouldCheckAllowance ?
      getQueryKey.allowanceCheck(token.address, chainConfig.id.toString(), walletAddress, amount.toString()) : [],
    queryFn: !publicClient || !chainConfig?.shielderConfig || !walletAddress || !shouldCheckAllowance ?
      skipToken :
      async (): Promise<boolean> => {
        try {
          const shielderConfig = chainConfig.shielderConfig;
          if (!shielderConfig) return false;

          const allowance = await publicClient.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [walletAddress, shielderConfig.shielderContractAddress],
          });
          return allowance < amount;
        } catch {
          return false;
        }
      },
    enabled: shouldCheckAllowance && !!publicClient && !!chainConfig?.shielderConfig && !!walletAddress,
  });

  const { data: gasEstimate } = useEstimateGas({
    to: token.address,
    data: needsApproval && chainConfig?.shielderConfig ?
      encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [chainConfig.shielderConfig.shielderContractAddress, amount],
      }) :
      undefined,
    account: walletAddress,
    query: {
      enabled:
        shouldCheckAllowance &&
        !!needsApproval &&
        !!chainConfig?.shielderConfig &&
        !!walletAddress,
    },
  });

  const { data: feeEstimate } = useEstimateFeesPerGas({
    chainId: chainConfig?.id,
    query: {
      enabled:
        shouldCheckAllowance &&
        !!needsApproval &&
        !!chainConfig?.shielderConfig &&
        !!walletAddress,
    },
  });

  const gasPrice = feeEstimate?.maxFeePerGas;

  const allowanceFee =
    gasEstimate && feeEstimate?.maxFeePerGas ?
      gasEstimate * feeEstimate.maxFeePerGas :
      null;

  if (!shouldCheckAllowance) {
    return {
      data: null,
      isLoading: false,
      error: null,
    };
  }

  return {
    data: needsApproval ? allowanceFee : allowanceFee,
    isLoading: needsApproval === undefined || (needsApproval && (!gasEstimate || !gasPrice)),
    error: null,
  };
};

export default useEstimateAllowanceFee;
