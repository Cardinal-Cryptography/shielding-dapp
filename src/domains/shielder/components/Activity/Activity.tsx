import dayjs from 'dayjs';
import { AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import styled from 'styled-components';
import { objectEntries } from 'tsafe';
import { v4 } from 'uuid';

import Badge from 'src/domains/misc/components/Badge';
import ScrollShadow from 'src/domains/misc/components/ScrollShadow';
import { PartialLocalShielderActivityHistory } from 'src/domains/shielder/stores/getShielderIndexedDB';
import { useActivityHistory } from 'src/domains/shielder/utils/useActivityHistory';
import vars from 'src/domains/styling/utils/vars';

import ActivityItem from './ActivityItem';
import ActivityPlaceholder from './ActivityPlaceholder';
import Empty from './Empty';

type GroupedTransactions = Record<string, PartialLocalShielderActivityHistory[]>;
type SortedTransactionEntry = [string, PartialLocalShielderActivityHistory[]];

const Activity = () => {
  const { data: transactions, isLoading } = useActivityHistory();

  // Group transactions by date
  const groupedTransactions = useMemo((): GroupedTransactions => {
    if (!transactions) return {};

    return transactions.reduce<GroupedTransactions>((acc, tx) => {
      const processedTx: PartialLocalShielderActivityHistory = {
        ...tx,
        type: tx.type === 'NewAccount' ? 'Deposit' : tx.type,
      };

      const timestamp = tx.submitTimestamp ?? tx.completedTimestamp;
      if (!timestamp) return acc;

      const dateString = dayjs(Number(timestamp)).format('MMM D');

      const existingTransactions = acc[dateString] ?? [];

      return {
        ...acc,
        [dateString]: [...existingTransactions, processedTx].toSorted((a, b) => {
          // Sort transactions within each group by timestamp (most recent first)
          const timestampA = a.completedTimestamp ?? a.submitTimestamp ?? 0;
          const timestampB = b.completedTimestamp ?? b.submitTimestamp ?? 0;
          return timestampB - timestampA;
        }),
      };
    }, {});
  }, [transactions]);

  const sortedTransactionGroups = useMemo((): SortedTransactionEntry[] => {
    const entries = objectEntries(groupedTransactions);

    if (entries.length === 0) {
      return [];
    }

    // Sort by the timestamp of the first transaction in each group (most recent first)
    const sortedEntries = entries.toSorted(([, transactionsA], [, transactionsB]) => {
      const timestampA = transactionsA[0]?.completedTimestamp ?? transactionsA[0]?.submitTimestamp ?? 0;
      const timestampB = transactionsB[0]?.completedTimestamp ?? transactionsB[0]?.submitTimestamp ?? 0;
      return timestampB - timestampA;
    });

    // Add NewAccount transaction to the last group (oldest/first chronologically) as the last item
    const lastGroupIndex = sortedEntries.length - 1;
    const [oldestDate, oldestTransactions] = sortedEntries[lastGroupIndex];

    const newAccountTransaction = {
      type: 'NewAccount' as const,
      localId: v4(),
    };

    const updatedOldestGroup: SortedTransactionEntry = [
      oldestDate,
      [...oldestTransactions, newAccountTransaction],
    ];

    const allButLastGroup = sortedEntries.slice(0, -1);
    return [...allButLastGroup, updatedOldestGroup];
  }, [groupedTransactions]);

  const hasNoTransactions = !transactions?.length && !isLoading;

  return (
    <Container>
      <AnimatePresence>
        {hasNoTransactions && <Empty />}
      </AnimatePresence>

      <ScrollShadow maxHeight="300px">
        {sortedTransactionGroups.map(([date, transactionGroup]) => (
          <Wrapper key={date}>
            <Group>
              <PaddingBox>
                <Badge
                  design="tint"
                  variant="subtle"
                  size="medium"
                  text={date}
                />
              </PaddingBox>
              {transactionGroup.map(transaction => (
                <ActivityItem
                  transaction={transaction}
                  key={transaction.txHash ?? transaction.localId}
                />
              ))}
            </Group>
          </Wrapper>
        ))}
      </ScrollShadow>

      <PlaceholderWrapper>
        {Array.from({ length: 10 }).map((_, index) => (
          <ActivityPlaceholder key={index} />
        ))}
      </PlaceholderWrapper>
    </Container>
  );
};

export default Activity;

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  height: 300px;
  overflow: hidden;
`;

const PaddingBox = styled.div`
  padding-inline: ${vars('--spacing-s')};
`;

const Wrapper = styled.div`
  display: flex;

  position: relative;

  flex-direction: column;
  gap: ${vars('--spacing-m')};

  width: 100%;
  padding-right: 8px;
  padding-bottom: ${vars('--spacing-l')};
  padding-inline: ${vars('--spacing-m')};

  overflow-x: hidden;
  overflow-y: auto;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;

  & > :first-child {
    margin-bottom: ${vars('--spacing-s')};
  }
`;

const PlaceholderWrapper = styled.div`
  display: flex;

  flex-direction: column;
  gap: ${vars('--spacing-m')};
  flex: 1;

  overflow: hidden;

  mask-image: linear-gradient(to top, transparent, black 100px);
`;
