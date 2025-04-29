import { useDebouncedCallback } from '@react-hookz/web';
import { motion } from 'framer-motion';
import { MouseEvent, type ReactNode, useState } from 'react';
import styled from 'styled-components';
import { isNullish } from 'utility-types';

import CIcon from 'src/domains/misc/components/CIcon';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  children: ReactNode,
  data?: string,
  className?: string,
  size?: number,
};

const CopyButton = ({
  children,
  data,
  className,
  size,
}: Props) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const clearSuccessState = useDebouncedCallback(() => void setIsSuccess(false), [], 1000);

  const handleCopy = async (e: MouseEvent) => {
    if (isNullish(data)) throw new Error('No data to copy. Should never happen!');
    e.stopPropagation();

    await navigator.clipboard.writeText(data);
    setIsSuccess(true);

    setTimeout(() => {
      clearSuccessState();
    }, 1000);
  };

  return (
    <StyledButton
      as="button"
      type="button"
      onClick={e => void handleCopy(e)}
      disabled={isNullish(data)}
      className={className}
    >
      {children}
      <IconWrapper
        key={isSuccess ? 'success' : 'copy'}
        initial={{ opacity: 0, y: isSuccess ? -5 : 0 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CIcon
          icon={isSuccess ? 'CheckmarkCircle' : 'Copy'}
          color={isSuccess ? vars('--color-status-success-foreground-1-rest') : undefined}
          size={size}
        />
      </IconWrapper>
    </StyledButton>
  );
};

export default CopyButton;

const StyledButton = styled.button`
  display: flex;

  align-items: center;
  justify-content: center;
  gap: ${vars('--spacing-m')};

  color: ${vars('--color-brand-foreground-1-rest')};

  border-radius: ${vars('--border-radius-m')};
  ${typography.decorative.body2};
  transition: color 0.2s;
`;

const IconWrapper = styled(motion.div)`
  display: flex;
  position: relative;
`;
