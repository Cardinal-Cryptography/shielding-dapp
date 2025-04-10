import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import {
  BREAKPOINTS,
  CHANGELOG_LINK,
  FEEDBACK_LINK,
  KNOWLEDGE_BASE_LINK, LANDING_PAGE_LINK,
  FAUCET_LINK,
  FRAUD_PROTECTION_LINK, TERMS_OF_SERVICE_LINK, PRIVACY_POLICY_LINK,
} from 'src/domains/misc/consts/consts';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import ThemeSelector from './ThemeSelector';

const Footer = () => (
  <Container>
    <ThemeSelector />
    <InnerContainer>
      <Link href={FEEDBACK_LINK} target="_blank" rel="noopener noreferrer">Feedback</Link>
      <Link href={CHANGELOG_LINK} target="_blank" rel="noopener noreferrer">Changelog</Link>
      <Link href={KNOWLEDGE_BASE_LINK} target="_blank" rel="noopener noreferrer">Help center</Link>
      <Link href={FAUCET_LINK} target="_blank" rel="noopener noreferrer">
        Get Testnet Tokens
      </Link>
      <Link href={LANDING_PAGE_LINK} target="_blank" rel="noopener noreferrer">common.fi</Link>
    </InnerContainer>
    <CopyrightContainer data-chromatic="ignore">
      <InnerContainer>
        <Copyright>
          Copyright © {new Date().getFullYear()} Common, ver. {import.meta.env.APP_VERSION}
        </Copyright>
        <Link href={TERMS_OF_SERVICE_LINK} target="_blank" rel="noopener noreferrer">
          Terms of service
        </Link>
        <Link href={PRIVACY_POLICY_LINK} target="_blank" rel="noopener noreferrer">
          Privacy policy
        </Link>
        <Link href={FRAUD_PROTECTION_LINK} target="_blank" rel="noopener noreferrer">
          Fraud Protection Policy
        </Link>
      </InnerContainer>
      <Button
        variant="outline"
        size="extra-small"
        rightIcon="Open"
        onClick={() => window.open('https://dex.common.fi/', '_blank', 'noopener')}
      >
        DEX and Bridge (WASM)
      </Button>
    </CopyrightContainer>
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

const CopyrightContainer = styled(InnerContainer)`
  justify-content: space-between;
`;

const Copyright = styled.div`
  width: 100%;
  color: ${vars('--color-neutral-foreground-4-rest')};
  ${typography.web.caption2}

  @media (width >= ${BREAKPOINTS.sm}) { /* stylelint-disable-line media-query-no-invalid */
    width: auto;
  }
`;

const Link = styled.a`
  color: ${vars('--color-neutral-foreground-4-rest')};

  text-decoration: underline;
  ${typography.web.caption2}
`;
