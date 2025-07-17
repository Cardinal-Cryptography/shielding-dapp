import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

const ContentBox = styled.div<{ $disableMargin?: boolean }>`
  padding: ${vars('--spacing-xxl')};
  margin: ${({ $disableMargin }) => $disableMargin ? 'none' : vars('--spacing-s')};
  background-color: ${vars('--color-neutral-background-3a-rest')};
  border-radius: ${vars('--border-radius-l')};
  overflow: hidden;
`;

export default ContentBox;
