import { motion } from 'motion/react';
import type { ComponentProps } from 'react';
import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

type Props = {
  loading?: boolean,
  noAnimation?: boolean,
} & ComponentProps<typeof Container>;

const Skeleton = ({ loading = true, children, noAnimation, ...props }: Props) => loading ? (
  <Container {...props}>
    {!noAnimation && (
      <LoadingAnimation
        initial={{ x: '-100%' }}
        animate={{ x: '50%' }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    )}
  </Container>
) : children;

export default Skeleton;

const Container = styled.span`
  display: flex;

  position: relative;
  
  border: 1px solid ${vars('--color-neutral-stroke-2-rest')};

  border-radius: ${vars('--border-radius-xs')};
  background: ${vars('--color-neutral-stroke-2-rest')};
  overflow: hidden;
`;

const LoadingAnimation = styled(motion.span)`
  position: absolute;
  top: 0;
  left: 0;

  height: 100%;
  width: 300%;

  background: ${vars('--color-neutral-background-canvas-rest')};
  transform: skewX(-20deg);
  
  mask-image: linear-gradient(100deg, transparent, rgb(0 0 0 / 20%), transparent);
`;
