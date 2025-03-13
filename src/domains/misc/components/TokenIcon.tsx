import type { ComponentType } from 'react';
import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

type Size = number | `${string}%` | `${string}px`;

type Props = {
  Icon?: ComponentType,
  size?: Size,
};

const TokenIcon = ({
  Icon,
  size = 16,
}: Props) => {
  const computedSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <Container
      style={{
        width: computedSize,
        height: computedSize,
      }}
    >
      {Icon && (
        <IconWrapper>
          <Icon />
        </IconWrapper>
      )}
    </Container>
  );
};

export default TokenIcon;

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: ${vars('--color-neutral-background-inverted-rest')};
  border-radius: ${vars('--border-radius-circular')};

  flex-shrink: 0;
`;

const IconWrapper = styled.div`
  height: 100%;
  width: 100%;
  
  & svg {
    height: 100%;
    width: 100%;
    
    * {
      fill: ${vars('--color-neutral-foreground-inverted-1-rest')}
    }
  }
`;
