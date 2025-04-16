import type { ComponentType } from 'react';
import styled from 'styled-components';
import { objectEntries, objectFromEntries } from 'tsafe';
import { Address } from 'viem';

import definitions from 'src/domains/chains/utils/definitions';
import vars from 'src/domains/styling/utils/vars';

type Size = number | `${string}%` | `${string}px`;

type Props = {
  size?: Size,
} & (
  | {
    Icon: ComponentType | undefined,
    address?: never,
  }
  | {
    Icon?: never,
    address: Address | undefined,
  }
  );

const addressToIconMap = objectFromEntries(
  Object.values(definitions).flatMap(chain =>
    Object.values(chain).flatMap(network =>
      objectEntries(network.whitelistedTokens).map(([address, token]) => [address, token.icon])
    )
  )
);

const TokenIcon = ({ size = 16, ...props }: Props) => {
  const computedSize = typeof size === 'number' ? `${size}px` : size;
  const IconComponent =
    'Icon' in props ?
      props.Icon : props.address ?
        addressToIconMap[props.address] : undefined;

  return (
    <Container style={{ width: computedSize, height: computedSize }}>
      {IconComponent && (
        <IconWrapper>
          <IconComponent />
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
  width: 100%;
  height: 100%;

  & svg {
    width: 100% !important;
    height: 100% !important;

    * {
      fill: ${vars('--color-neutral-foreground-inverted-1-rest')};
    }
  }
`;
