import { motion } from 'framer-motion';
import styled from 'styled-components';

import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const Empty = () => (
  <Text
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: 1, y: -20 }}
    exit={{ opacity: 0, y: 0 }}
  >
    <p>No activity found</p>
    <p>It seems like you haven't used Shielded Account with this account, yet. Your activity will appear here.</p>
  </Text>
);

export default Empty;

const Text = styled(motion.div)`
  display: flex;

  position: absolute;
  inset: 0;

  flex-direction: column;
  justify-content: center;
  align-items: center;   
  gap: ${vars('--spacing-s')};

  text-align: center;
  
  & > :first-of-type {
    ${typography.decorative.subtitle2}
  }

  & > :last-of-type {
    max-width: 322px;
    color: ${vars('--color-neutral-foreground-2-rest')};
    ${typography.web.body1};
  }
`;
