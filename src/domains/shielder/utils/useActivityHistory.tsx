import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';

import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import {
  getLocalShielderActivityHistoryIndexedDB,
} from 'src/domains/shielder/stores/getShielderIndexedDB';

export const useActivityHistory = () => {
  const { address, chainId } = useAccount();
  const queryClient = useQueryClient();

  const isReady = !!address && !!chainId;

  const db = useMemo(
    () => (address ? getLocalShielderActivityHistoryIndexedDB(address) : undefined),
    [address]
  );

  const upsertTransaction = useCallback(
    async (...params: Parameters<NonNullable<typeof db>['upsertItem']>) => {
      if (!db || !address || !chainId) return params[1];

      const tx = await db.upsertItem(...params);
      void queryClient.invalidateQueries({
        queryKey: getQueryKey.shielderTransactions(address, chainId),
      });
      return tx;
    },
    [db, address, chainId, queryClient]
  );

  const queryResult = useQuery({
    queryKey: isReady ? getQueryKey.shielderTransactions(address, chainId) : [],
    queryFn: isReady ?
      async () => {
        const transactions = await getLocalShielderActivityHistoryIndexedDB(address).getItems(chainId);
        if (!transactions) return [];

        // Sort transactions by timestamp (most recent first)
        // eslint-disable-next-line no-restricted-syntax
        return transactions.sort((a, b) => {
          const timestampA = a.completedTimestamp ?? a.submitTimestamp ?? 0;
          const timestampB = b.completedTimestamp ?? b.submitTimestamp ?? 0;
          return timestampB - timestampA;
        });
      } :
      skipToken,
    enabled: isReady,
  });

  return {
    ...queryResult,
    upsertTransaction,
  };
};

type Selector = {
  txHash?: string,
  localId?: string,
};

export const useActivity = (selector: Selector) => {
  const { data: transactions, ...queryResult } = useActivityHistory();

  const selectedTransaction = useMemo(() => {
    if (!transactions || (!selector.txHash && !selector.localId)) return undefined;

    const foundTransaction = transactions.find(transaction => {
      if (selector.txHash && transaction.txHash === selector.txHash) return true;
      return !!(selector.localId && transaction.localId === selector.localId);
    });

    if (!foundTransaction) return undefined;

    // Replace NewAccount type with Deposit for display purposes
    return {
      ...foundTransaction,
      type: foundTransaction.type === 'NewAccount' ? 'Deposit' : foundTransaction.type,
    };
  }, [transactions, selector.txHash, selector.localId]);

  return {
    ...queryResult,
    data: selectedTransaction,
  };
};
