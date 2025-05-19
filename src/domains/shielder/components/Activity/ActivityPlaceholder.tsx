import styled from 'styled-components';

import Skeleton from 'src/domains/misc/components/Skeleton';
import vars from 'src/domains/styling/utils/vars';

const ActivityPlaceholder = () => (
  <PaddingBox>
    <Boilerplate>
      <Avatar noAnimation />
      <Wrapper>
        <Column>
          <Skeleton style={{ height: 10, width: 36 }} noAnimation />
          <Skeleton style={{ height: 12, width: 87 }} noAnimation />
        </Column>
        <Column>
          <Skeleton style={{ height: 10, width: 59 }} noAnimation />
          <Skeleton style={{ height: 12, width: 87 }} noAnimation />
        </Column>
      </Wrapper>
    </Boilerplate>
  </PaddingBox>
);

export default ActivityPlaceholder;

const PaddingBox = styled.div`
  padding-inline: ${vars('--spacing-l')};
`;

const Boilerplate = styled.div`
  display: flex;
  gap: ${vars('--spacing-m')};
  opacity: 0.2;
`;

const Avatar = styled(Skeleton)`
  height: 40px;
  width: 40px;
  border-radius: ${vars('--border-radius-circular')};
`;

const Wrapper = styled.div`
  display: flex;
  flex:1;
  justify-content: space-between;
  align-items: center;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xs')};
`;
