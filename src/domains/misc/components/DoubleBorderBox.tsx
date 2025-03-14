import styled from 'styled-components';

import { backgroundFilters } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const borderSize = 1;

const Wrapper = styled.div`
  position: relative;
  padding: ${borderSize}px;
  background-color: ${vars('--color-neutral-background-alpha-4-rest')};
  border-radius: ${vars('--border-radius-xxl')};

  &::after {
    content: "";

    position: absolute;
    inset: 0;

    border: ${borderSize}px solid ${vars('--color-neutral-stroke-gradient-color-a')};

    border-radius: inherit;
    pointer-events: none;

    mask-image: linear-gradient(to bottom right, black, transparent 60%);
  }
`;

const Content = styled(Wrapper)<{ $disableMargin?: boolean }>`
  padding: ${vars('--spacing-xxl')};
  margin: ${({ $disableMargin }) => $disableMargin ? 'none' : vars('--spacing-s')};
  background-color: ${vars('--color-neutral-background-3a-rest')};
  border-radius: calc(${vars('--border-radius-l')} - ${borderSize}px);
  overflow: hidden;
  ${backgroundFilters.backgroundBlur1};
  
  &::after {
    border-radius: inherit;
  }
`;

export default { Wrapper, Content };
