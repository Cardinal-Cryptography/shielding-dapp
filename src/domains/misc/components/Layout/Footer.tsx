import styled from 'styled-components';

import { BREAKPOINTS, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import ThemeSelector from './ThemeSelector';

const Footer = () => (
  <Container>
    <ThemeSelector />
    <InnerContainer data-chromatic="ignore">
      <Copyright>
        Copyright © {new Date().getFullYear()} Shielder, ver. {__APP_VERSION__}
      </Copyright>
    </InnerContainer>
  </Container>
);

export default Footer;

const Container = styled.footer`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xxl')};
  padding: ${vars('--spacing-l')};
  
  @media (width >= ${BREAKPOINTS.sm}) { /* stylelint-disable-line media-query-no-invalid */
    padding: ${vars('--spacing-l')} ${vars('--spacing-xxl')};
  }
  
  @media (width >= ${BREAKPOINTS.md}) { /* stylelint-disable-line media-query-no-invalid */
    padding: ${vars('--spacing-xxl')} ${vars('--spacing-xxxl')};
  }
`;

const InnerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xxl')};

  flex-wrap: wrap;
`;

const Copyright = styled.div`
  width: 100%;
  color: ${vars('--color-neutral-foreground-4-rest')};
  ${typography.web.caption2}

  @media (width >= ${BREAKPOINTS.sm}) { /* stylelint-disable-line media-query-no-invalid */
    width: auto;
  }
`;
