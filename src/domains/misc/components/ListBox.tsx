import styled, { css } from 'styled-components';

import * as SplitBox from 'src/domains/misc/components/SplitBox';
import vars from 'src/domains/styling/utils/vars';

const Section = styled(SplitBox.Section)<{ $noHover?: boolean }>`
  display: flex;
  align-items: center;
  padding-block: ${vars('--spacing-m')};
  padding-inline: ${vars('--spacing-l')};
  
  ${({ as, $noHover }) => as === 'button' && !$noHover && css`
    &:hover {
      background: ${vars('--color-neutral-background-2-hover')};
    }

    &:disabled {
      pointer-events: none;
    }
  `}
`;

const Container = styled(SplitBox.Container)`
  gap: 0;

  & > ${Section}:not(:last-of-type) {
    border-bottom: 1px solid ${vars('--color-neutral-stroke-2-rest')};
  }
`;

export default { Container, Section };
