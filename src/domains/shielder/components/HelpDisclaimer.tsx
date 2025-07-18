import { styled } from 'styled-components';

import BIcon from 'src/domains/misc/components/BIcon';
import ContentBox from 'src/domains/misc/components/ContentBox';
import { FRAUD_PROTECTION_LINK } from 'src/domains/misc/consts/consts';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const HelpDisclaimer = () => (
  <Container>
    <BIcon size={20} icon="CheckmarkStarburst" />
    <Text>
      BlankSquare's privacy system is protected from fraud.
      {' '}
      <Link href={FRAUD_PROTECTION_LINK} target="_blank" rel="noopener noreferrer">Learn how</Link>
    </Text>
  </Container>
);

export default HelpDisclaimer;

const Container = styled(ContentBox)`
  display: flex;
  
  align-items: start;
  gap: ${vars('--spacing-s')};

  width: 100%;
  padding: ${vars('--spacing-l')};

  color: ${vars('--color-neutral-foreground-3-rest')};
`;

const Text = styled.p`
  color: ${vars('--color-neutral-foreground-4-rest')};
  ${typography.caption1}
`;

const Link = styled.a`
  color: ${vars('--color-neutral-foreground-4-rest')};
  text-decoration-line: underline;
  white-space: nowrap;
`;
