import { erc20Abi, encodeFunctionData } from 'viem';
import { useEstimateFeesPerGas, useEstimateGas } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider.tsx';
import { Token } from 'src/domains/chains/types/misc';
import useChain from 'src/domains/chains/utils/useChain';

type Props = {
  token: Token,
  amount: bigint,
  disabled?: boolean,
};

const useEstimateAllowanceFee = ({ token, amount, disabled }: Props) => {
  const chainConfig = useChain();
  const { address: walletAddress } = useWallet();

  const shouldCheckAllowance = !token.isNative && amount > 0n && !disabled;

  const { data: gasEstimate, isLoading: isGasEstimateLoading } = useEstimateGas({
    to: token.address,
    data: chainConfig?.shielderConfig ?
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
        !!chainConfig?.shielderConfig &&
        !!walletAddress,
    },
  });

  const { data: feeEstimate, isLoading: isFeeEstimateLoading } = useEstimateFeesPerGas({
    chainId: chainConfig?.id,
    query: {
      enabled:
        shouldCheckAllowance &&
        !!chainConfig?.shielderConfig &&
        !!walletAddress,
    },
  });

  const gasPrice = feeEstimate?.maxFeePerGas;

  const allowanceFee =
    gasEstimate && gasPrice?
      gasEstimate * gasPrice :
      null;

  if (!shouldCheckAllowance) {
    return {
      data: null,
      isLoading: false,
    };
  }

  return {
    data: allowanceFee,
    isLoading: isGasEstimateLoading || isFeeEstimateLoading,
  };
};

export default useEstimateAllowanceFee;
