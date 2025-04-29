import { motion } from 'framer-motion';
import styled from 'styled-components';

import { transitionTime } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { FORE_GROUND_TRACK_COLOR_VAR } from './consts';

const BORDER_SIZE = 1;

export default styled(motion.div)<{ $thumbSize: number }>`
  display: grid;

  place-items: center;
  grid-area: 1 / 1 / 2 / 2;

  height: ${props => props.$thumbSize}px;
  width: ${props => props.$thumbSize}px;
  margin-left: -${props => props.$thumbSize / 2}px;
  border: ${BORDER_SIZE}px solid ${vars('--color-neutral-stroke-1-rest')};

  background-color: ${vars('--color-neutral-background-1-rest')};
  border-radius: ${vars('--border-radius-circular')};
  cursor: pointer;

  contain: paint; /* removes grid display inconsistencies of centered elements of small sizes, such that "(size / 2) % 1 > 0" */
  
  &::before {
    content: '';
    display: block;

    height: ${props => getInnerSize(props.$thumbSize)}px;
    width: ${props => getInnerSize(props.$thumbSize)}px;

    border-radius: ${vars('--border-radius-circular')};
    background-color: var(${FORE_GROUND_TRACK_COLOR_VAR});
    transition: background-color ${transitionTime};
  }
`;

const getInnerSize = (outerSize: number) => (outerSize - BORDER_SIZE) * 0.65;
