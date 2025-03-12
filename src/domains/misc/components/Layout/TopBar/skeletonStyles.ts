import { css, keyframes } from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

const skeletonWave = keyframes`
  from { background-position-x: 300%; }
  to { background-position-x: 0; }
`;

export default css`
  background-attachment: fixed;
  background-position-x: 50%;
  background-position-y: 50%;
  background-size: 300% 100%;
  background-image: linear-gradient(
    to right, 
    ${vars('--color-neutral-background-stencil-1-rest')} 0%,
    ${vars('--color-neutral-background-stencil-2-rest')} 50%,
    ${vars('--color-neutral-background-stencil-1-rest')} 100%
  );
  animation: ${skeletonWave} 3s linear infinite;
`;
