import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

export default styled.div`
  display: grid;

  position: relative;

  place-items: center;

  height: 120px;
  width: 100%;
  border: 1px solid ${vars('--color-neutral-stroke-2-rest')};

  border-radius: ${vars('--border-radius-m')};
  overflow: hidden;

  background-size: 16px 16px;
  background-image:
          linear-gradient(to right, ${vars('--color-neutral-stroke-3-rest')} 1px, transparent 1px),
          linear-gradient(to bottom, ${vars('--color-neutral-stroke-3-rest')} 1px, ${vars('--color-neutral-background-3-rest')} 1px);
  background-position: -8px;
`;
