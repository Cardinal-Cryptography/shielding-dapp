import dayjs from 'dayjs';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { objectEntries } from 'tsafe';

import Badge from 'src/domains/misc/components/Badge';
import ScrollShadow from 'src/domains/misc/components/ScrollShadow';
import { Transactions } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useTransactionsHistory from 'src/domains/shielder/utils/useTransactionsHistory';
import vars from 'src/domains/styling/utils/vars';

import ActivityItem from './ActivityItem';
import ActivityPlaceholder from './ActivityPlaceholder';
import Empty from './Empty';

const Activity = () => {
  const { data, isLoading } = useTransactionsHistory();

  const grouped = data?.reduce<Record<string, Transactions>>((acc, tx) => {
    const date = dayjs(tx.timestamp).format('YYYY-MM-DD');
    const newTx = tx.type === 'NewAccount' ? [ { ...tx, type: 'Deposit' as const }, { ...tx }] : [tx];
    return {
      ...acc,
      [date]: [...newTx, ...(acc[date] ?? [])],
    };
  }, {});

  // eslint-disable-next-line no-restricted-syntax
  const sorted = grouped ? objectEntries(grouped)
    .sort(([a], [b]) => dayjs(b).valueOf() - dayjs(a).valueOf()) : [];

  return (
    <Container>
      <AnimatePresence>
        {!data && !isLoading && <Empty />}
      </AnimatePresence>
      <ScrollShadow maxHeight="300px">
        {sorted.map(([date, transactions]) => (
          <Wrapper>
            <Group key={date}>
              <PaddingBox>
                <Badge
                  design="tint"
                  variant="subtle"
                  size="medium"
                  text={dayjs(date).format('MMM D')}
                />
              </PaddingBox>
              {transactions.map(transaction => (
                <ActivityItem transaction={transaction} key={transaction.txHash} />
              ))}
            </Group>
          </Wrapper>
        ))}
      </ScrollShadow>
      <PlaceholderWrapper>
        {Array.from({ length: 10 }).map((_, i) => (
          <ActivityPlaceholder key={i} />
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
