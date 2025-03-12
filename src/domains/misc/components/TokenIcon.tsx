import type { ComponentProps } from 'react';
import styled from 'styled-components';

import CIcon, { IconName } from 'src/domains/misc/components/CIcon';
import vars from 'src/domains/styling/utils/vars';

type Size = number | `${string}%` | `${string}px`;

type Props = {
  icon?: IconName,
  size?: Size,
  iconProps?: Omit<ComponentProps<typeof CIcon>, 'icon'>,
};

const TokenIcon = ({
  icon,
  size = 16,
  iconProps,
}: Props) => {
  const computedSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <Container
      style={{
        width: computedSize,
        height: computedSize,
      }}
    >
      {icon && (
        <CIcon
          icon={icon}
          color={vars('--color-neutral-foreground-inverted-1-rest')}
          size="100%"
          {...iconProps}
        />
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
