import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import getQueryKey from 'src/domains/misc/utils/getQueryKey.ts';
import { getTransactionsIndexedDB } from 'src/domains/shielder/stores/getShielderIndexedDB';

const useTransactionsHistory = () => {
  const { address, chainId } = useAccount();

  const query = useQuery({
    queryKey: address && chainId ? getQueryKey.shielderTransactions(address, chainId) : [],
    queryFn: async () => {
      if (!address || !chainId) return null;
      const db = getTransactionsIndexedDB(address);
      return db.getItem(chainId);
    },
    enabled: !!address && !!chainId,
  });

  return query;
};

export default useTransactionsHistory;
