import { motion } from 'framer-motion';
import { type ReactNode, useState } from 'react';
import styled from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  children: ReactNode,
  className?: string,
  size?: number,
  onPaste: (value: string) => void,
};

const PasteButton = ({
  children,
  className,
  size,
  onPaste,
}: Props) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => void setIsSuccess(false), 1000);
  };

  const handleClick = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      onPaste(clipboardText);
      triggerSuccess();
    } catch (error) {
      console.error('Failed to read clipboard contents:', error);
    }
  };

  return (
    <StyledButton
      as="button"
      type="button"
      onClick={() => void handleClick()}
      className={className}
    >
      <IconWrapper
        key={isSuccess ? 'success' : 'paste'}
        initial={{ opacity: 0, y: isSuccess ? -5 : 0 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CIcon
          icon={isSuccess ? 'CheckmarkCircle' : 'ClipboardPaste'}
          color={isSuccess ? vars('--color-status-success-foreground-1-rest') : undefined}
          size={size}
        />
      </IconWrapper>
      {children}
    </StyledButton>
  );
};

export default PasteButton;

const StyledButton = styled.button`
  display: flex;

  align-items: center;
  justify-content: center;
  gap: ${vars('--spacing-xs')};

  border-radius: ${vars('--border-radius-m')};
  ${typography.decorative.caption1Strong};
  transition: color 0.2s;
`;

const IconWrapper = styled(motion.div)`
  display: flex;
  position: relative;
`;
