import dayjs from 'dayjs';
import { useMemo } from 'react';
import styled from 'styled-components';

import ActivityIcon from 'src/domains/shielder/components/ActivityIcon';
import { PartialLocalShielderActivityHistory } from 'src/domains/shielder/stores/getShielderIndexedDB';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  transaction: PartialLocalShielderActivityHistory,
};

const Title = ({ transaction }: Props) => {
  const title = useMemo(() => {
    if (transaction.type === 'Deposit') {
      if(!transaction.status) return 'Shielding';

      return {
        failed: 'Shielding failed',
        completed: 'Shielded',
        pending: 'Shielding',
      }[transaction.status];
    }
    if (transaction.type === 'Withdraw') {
      if(!transaction.status) return 'Sending privately';

      return {
        failed: 'Sending privately failed',
        completed: 'Sent privately',
        pending: 'Sending privately',
      }[transaction.status]; }
  }, [transaction]);

  return (
    <Wrapper>
      <ActivityIcon type={transaction.type} size={40} status={transaction.status} />
      <Container>
        <p>{title}</p>
        <p>
          {
            (!!transaction.submitTimestamp || !!transaction.completedTimestamp) &&
            dayjs(transaction.submitTimestamp ?? transaction.completedTimestamp).format('DD MMM YYYY')
          }
        </p>
      </Container>
    </Wrapper>
  );
};

export default Title;

const Wrapper = styled.div`
  display: flex;
  gap: ${vars('--spacing-s')};
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  
  & > :first-of-type {
    ${typography.decorative.subtitle2};
  };

  & > :last-of-type {
    ${typography.web.caption2};
    color:${vars('--color-neutral-foreground-3-rest')}  
  };
`;
