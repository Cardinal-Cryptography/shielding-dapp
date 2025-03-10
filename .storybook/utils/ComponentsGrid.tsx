import styled from 'styled-components';

import { vars } from '../../src/domains/common/styles/utils';

export default styled.div<{ $columnsCount: number }>`
  display: grid;

  align-items: center;
  gap: 10px;
  grid-template-columns: repeat(${props => props.$columnsCount}, 1fr);
  grid-auto-rows: 1fr;
  justify-items: center;
`;

export const HeaderCell = styled.span`
  color: ${vars('--color-neutral-foreground-1-rest')};
`;
