import dayjs from 'dayjs';
import styled from 'styled-components';

import ActivityIcon from 'src/domains/shielder/components/ActivityIcon';
import { Transactions } from 'src/domains/shielder/stores/getShielderIndexedDB';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  transaction: Transactions[number],
};

const Title = ({ transaction }: Props) => (
  <Wrapper>
    <ActivityIcon type={transaction.type} size={40} />
    <Container>
      <h6>{transaction.type === 'Deposit' ? 'Shielded' : 'Sent privately'}</h6>
      <p>{dayjs(transaction.timestamp).format('DD MMM YYYY')}</p>
    </Container>
  </Wrapper>
);

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
  ${typography.decorative.subtitle2};
  
  & > p {
    ${typography.web.caption2};
    color:${vars('--color-neutral-foreground-3-rest')}
  }
`;
