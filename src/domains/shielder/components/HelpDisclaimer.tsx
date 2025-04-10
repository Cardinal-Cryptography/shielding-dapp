import { styled } from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import { FRAUD_PROTECTION_LINK } from 'src/domains/misc/consts/consts';
import { backgroundFilters, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const HelpDisclaimer = () => (
  <Container>
    <CIcon size={20} icon="CheckmarkStarburst" />
    <Text>
      Common's privacy system is protected from fraud. <Link href={FRAUD_PROTECTION_LINK}>Learn how</Link>
    </Text>
  </Container>
);

export default HelpDisclaimer;

const Container = styled.div`
  display: flex;
  
  align-items: start;
  gap: ${vars('--spacing-s')};

  padding: ${vars('--spacing-l')};

  color: ${vars('--color-neutral-foreground-3-rest')};

  border-radius: ${vars('--border-radius-xxl')};
  background: ${vars('--color-neutral-background-alpha-4-rest')};

  ${backgroundFilters.backgroundBlur6}
`;

const Text = styled.p`
  color: ${vars('--color-neutral-foreground-4-rest')};
  ${typography.web.caption1}
`;

const Link = styled.a`
  color: ${vars('--color-neutral-foreground-4-rest')};
  text-decoration-line: underline;
  white-space: nowrap;
`;
