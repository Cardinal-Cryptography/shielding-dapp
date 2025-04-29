import { AnimatePresence, motion } from 'framer-motion';
import { ComponentProps, useRef, MouseEvent } from 'react';
import styled, { css, RuleSet } from 'styled-components';

import CIcon, { IconName } from 'src/domains/misc/components/CIcon';
import { transitionTime, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import Button from './Button';

type Size = 'large' | 'small';
type Variant = 'filled-darker' | 'outline';

type Props = {
  size: Size,
  variant: Variant,
  leftIcon?: IconName,
  rightIcon?: IconName,
  onClear?: () => void,
} & Omit<ComponentProps<'input'>, 'size'>;

const TextInput = ({
  size,
  variant,
  leftIcon,
  rightIcon,
  className,
  onClear,
  ...props
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClear?.();
  };

  return (
    <Container
      $size={size}
      $variant={variant}
      onClick={() => inputRef.current?.focus()}
      className={className}
    >
      {leftIcon && <CIcon icon={leftIcon} size={24} />}
      <Input ref={inputRef} {...props} />
      <AnimatePresence>
        {onClear && !!props.value?.toString().length && (
          <ClearButton
            initial={{ x: '5px', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '5px', opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClear}
            size={size ==='large' ? 'medium' : 'extra-small'}
            variant="transparent"
            rightIcon="DismissCircle"
          />
        )}
      </AnimatePresence>
      {rightIcon && <CIcon icon={rightIcon} size={24} />}
    </Container>
  );
};

export default TextInput;

type ContainerProps = {
  $size: Size,
  $variant: Variant,
};

const perVariant = <T extends string | RuleSet>(variants: Record<Variant, T>) =>
  ({ $variant }: ContainerProps) => variants[$variant];
const perSize = <T extends string | RuleSet>(sizes: Record<Size, T>) =>
  ({ $size }: ContainerProps) => sizes[$size];

const BORDER_SIZE = 1;
const BAR_SIZE = 2;

const Container = styled.div<ContainerProps>`
  display: flex;

  position: relative;

  align-items: center;
  gap: ${vars('--spacing-xs')};

  padding-inline: ${perSize({
    large: vars('--spacing-l-nudge'),
    small: vars('--spacing-s'),
  })};
  padding-block: ${perSize({
    large: vars('--spacing-l'),
    small: vars('--spacing-s-nudge-2'),
  })};

  color: ${vars('--color-neutral-foreground-4-rest')};

  background-color: ${perVariant({
    'filled-darker': vars('--color-neutral-background-3-rest'),
    outline: vars('--color-neutral-background-1-rest'),
  })};
  border-radius: ${vars('--border-radius-s')};
  cursor: text;
  transition: border-color ${transitionTime};

  ${perVariant({
    'filled-darker': css`border: none;`,
    outline: css`border: ${BORDER_SIZE}px solid ${vars('--color-neutral-stroke-1-rest')}`,
  })};

  ${typography.web.body1}

  & * {
    fill: ${vars('--color-neutral-foreground-3-rest')};
  }

  &::before, &::after {
    content: "";

    position: absolute;
    inset: -${BORDER_SIZE}px;

    border-radius: ${vars('--border-radius-s')};
    transition: background-color ${transitionTime}, transform ${transitionTime}, opacity ${transitionTime};

    clip-path: inset(calc(100% - ${BAR_SIZE}px) 0 0);
  }

  &::before {
    background-color: transparent;
  }

  &::after {
    opacity: 0;
    transform: scale3d(0, 1, 1);
  }

  &:hover {
    border-color: ${vars('--color-neutral-stroke-1-hover')};

    &::before {
      background-color: ${vars('--color-neutral-stroke-1-hover')};
    }
  }

  &:active {
    &::after {
      opacity: 1;
      transform: scale3d(1, 1, 1);
      background-color: ${vars('--color-brand-stroke-compound-pressed')};
    }
  }

  &:has(input:focus-visible) {
    &::after {
      opacity: 1;
      transform: scale3d(1, 1, 1);
      background-color: ${vars('--color-brand-stroke-compound-rest')};
    }
  }

  &:has(input:active) {
    &::after {
      opacity: 1;
      transform: scale3d(1, 1, 1);
      background-color: ${vars('--color-brand-stroke-compound-pressed')};
    }
  }
`;

const Input = styled.input`
  flex-grow: 1;

  min-width: 0;
  border: none;

  color: ${vars('--color-neutral-foreground-4-rest')};

  background-color: transparent;
  outline: none;
  transition: color ${transitionTime};

  ${typography.web.body2}

  &::placeholder {
    color: ${vars('--color-neutral-foreground-4-rest')};
  }

  &:focus-visible {
    color: ${vars('--color-neutral-foreground-1-rest')};
  }
`;

const ClearButton = styled(motion(Button))`
  padding: 0;
  height: inherit;
`;
