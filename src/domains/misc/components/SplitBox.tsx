import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

export const Section = styled.section`
  padding-block: ${vars('--spacing-m')};
  padding-inline: ${vars('--spacing-l')};
  background-color: ${vars('--color-neutral-background-2-rest')};
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xxs-nudge')};

  & > ${Section}:first-of-type {
    border-top-left-radius: ${vars('--border-radius-m')};
    border-top-right-radius: ${vars('--border-radius-m')};
  }
  
  & > ${Section}:last-of-type {
    border-bottom-left-radius: ${vars('--border-radius-m')};
    border-bottom-right-radius: ${vars('--border-radius-m')};
  }
`;
