import { skipToken, useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { estimateFeesPerGas } from 'viem/actions';
import { usePublicClient } from 'wagmi';

import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import isPresent from 'src/domains/misc/utils/isPresent';

type Props = {
  walletAddress: Address | undefined,
};

// Temporary hardcoded for now since chain-specific gas limit API is not available.
// Used to estimate max shieldable amount: max_amount = token_balance - (gas_price * gas_limit)
const SHIELD_ACTION_GAS_LIMIT = 2_400_000n;

const useTransactionFee = ({ walletAddress }: Props) => {
  const publicClient = usePublicClient();
  const { data: { maxFeePerGas, gas } = {}} = useQuery({
    queryKey: walletAddress ? getQueryKey.estimateFeesPerGas(walletAddress) : [],
    queryFn: !publicClient ?
      skipToken :
      async () => {
        const { maxFeePerGas } = await estimateFeesPerGas(publicClient);
        return { maxFeePerGas, gas: SHIELD_ACTION_GAS_LIMIT };
      },
  });

  return isPresent(maxFeePerGas) && isPresent(gas) ? maxFeePerGas * gas : undefined;
};

export default useTransactionFee;
