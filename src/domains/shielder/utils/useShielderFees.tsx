import { useMemo } from 'react';

import { Token } from 'src/domains/chains/types/misc';
import useSendingFees from 'src/domains/shielder/utils/useSendingFees';
import useShieldingFees, { FeeItem } from 'src/domains/shielder/utils/useShieldingFees';

export type { FeeItem } from 'src/domains/shielder/utils/useShieldingFees';
export type FeeStructure = FeeItem[];

type Props = {
  operation: 'shield' | 'send',
  token: Token,
  amount?: bigint,
};

const useShielderFees = ({ token, operation, amount }: Props) => {
  const shieldingFeesResult = useShieldingFees({
    token,
    amount,
    disabled: operation !== 'shield',
  });

  const sendingFeesResult = useSendingFees({
    token,
    disabled: operation !== 'send',
  });

  const fees = operation === 'shield' ? shieldingFeesResult.fees : sendingFeesResult.fees;
  const isLoading = operation === 'shield' ? shieldingFeesResult.isLoading : sendingFeesResult.isLoading;
  const error = operation === 'shield' ? shieldingFeesResult.error : sendingFeesResult.error;

  const totalFee = useMemo(() => {
    return fees?.reduce((total, fee) => total + fee.amount, 0n);
  }, [fees]);

  return {
    fees,
    totalFee,
    isLoading,
    error,
  };
};

export default useShielderFees;
