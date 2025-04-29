import { motion } from 'framer-motion';
import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

export const Track = styled.div`
  height: 4px;
  background-color: ${vars('--color-neutral-background-6-rest')};
  border-radius: ${vars('--spacing-xxs')};
  pointer-events: none;
  overflow: hidden;
`;

export const Progress = styled(motion.div).attrs(props => ({
  style: {
    ...props.style,
    originX: 0,
  },
}))`
  width: 100%;
  height: 100%;
  background-color: ${vars('--color-brand-background-compound-rest')};
`;
