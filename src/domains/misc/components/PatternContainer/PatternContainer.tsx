import { ReactNode } from 'react';
import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

import Checkers from './checkers.svg?react';

type Props = {
  className?: string,
  children?: ReactNode,
};

const PatternContainer = ({ className, children }: Props) => (
  <Container className={className}>
    <Background />
    {children}
  </Container>
);

export default PatternContainer;

const Container = styled.div`
  display: grid;

  position: relative;

  place-items: center;

  height: 120px;
  width: 100%;
  border: 1px solid ${vars('--color-neutral-stroke-2-rest')};

  border-radius: ${vars('--border-radius-m')};
  background: ${vars('--color-neutral-background-3-rest')};
  overflow: hidden;
`;

const Background = styled(Checkers)`
  position: absolute;
  left: 50%;
  width: 150%;
  transform: translateX(-50%);

  * {
    stroke: ${vars('--color-neutral-stroke-3-rest')};
  }
`;
