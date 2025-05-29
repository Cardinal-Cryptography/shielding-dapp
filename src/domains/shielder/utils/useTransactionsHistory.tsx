import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';

import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import {
  getLocalShielderActivityHistoryIndexedDB,
  PartialLocalShielderActivityHistory,
} from 'src/domains/shielder/stores/getShielderIndexedDB';

export const useTransactionsHistory = () => {
  const { address, chainId } = useAccount();
  const queryClient = useQueryClient();

  const isReady = !!address && !!chainId;

  const db = useMemo(
    () => (address ? getLocalShielderActivityHistoryIndexedDB(address) : undefined),
    [address]
  );

  const upsertTransaction = useCallback(
    async (...params: Parameters<NonNullable<typeof db>['upsertItem']>) => {
      if (!db || !address || !chainId) return;

      await db.upsertItem(...params);

      await queryClient.invalidateQueries({
        queryKey: getQueryKey.shielderTransactions(address, chainId),
      });
    },
    [db, address, chainId, queryClient]
  );

  return {
    ...useQuery({
      queryKey: isReady ? getQueryKey.shielderTransactions(address, chainId) : [],
      queryFn: isReady ?
        async () =>
          (await getLocalShielderActivityHistoryIndexedDB(address).getItems(chainId)) ?? [] :
        skipToken,
      enabled: isReady,
    }),
    upsertTransaction,
  };
};

type TransactionSelector = {
  txHash?: string,
  localId?: string,
};

export const useTransaction = (selector: TransactionSelector) => {
  const { data: transactions, ...queryResult } = useTransactionsHistory();

  const selectedTransaction = useMemo(() => {
    if (!transactions || (!selector.txHash && !selector.localId)) return undefined;

    return transactions.find(transaction => {
      if (selector.txHash && transaction.txHash === selector.txHash) return true;
      return !!(selector.localId && transaction.localId === selector.localId);
    });
  }, [transactions, selector.txHash, selector.localId]);

  return {
    ...queryResult,
    data: (selectedTransaction ?? {}) as PartialLocalShielderActivityHistory,
  };
};
