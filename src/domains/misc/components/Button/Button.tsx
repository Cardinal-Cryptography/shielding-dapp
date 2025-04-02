import { ComponentProps, forwardRef, ReactNode } from 'react';
import styled, { css, RuleSet } from 'styled-components';

import CIcon, { type IconName } from 'src/domains/misc/components/CIcon';
import { transitionTime, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Size = 'large' | 'medium' | 'small' | 'extra-small' | 'tiny';
type Variant = 'primary' | 'secondary' | 'outline' | 'subtle' | 'transparent' | 'danger';

const ICON_SIZE_MAP = {
  large: 24,
  medium: 24,
  small: 20,
  'extra-small': 20,
  tiny: 16,
} satisfies Record<Size, number>;

type Props = {
  children?: ReactNode,
  size?: Size,
  variant: Variant,
  selected?: boolean,
  leftIcon?: IconName,
  rightIcon?: IconName,
  isLoading?: boolean,
} & ComponentProps<'button'>;

const Button = forwardRef<HTMLButtonElement, Props>(({
  children,
  size = 'medium',
  variant,
  selected,
  leftIcon,
  rightIcon,
  isLoading,
  ...props
}, ref) => (
  <DomButton
    ref={ref}
    {...props}
    disabled={!!props.disabled || !!isLoading}
    size={size}
    variant={variant}
    center={!leftIcon && !rightIcon}
    selected={selected}
    $iconOnly={!children}
  >
    {isLoading ? <LoadingIcon icon="Spinner" size={ICON_SIZE_MAP[size] * 0.75} /> : leftIcon && <CIcon icon={leftIcon} size={ICON_SIZE_MAP[size]} />}
    {children}
    {rightIcon && <CIcon icon={rightIcon} size={ICON_SIZE_MAP[size]} />}
  </DomButton>
));

export default styled(Button)``;

type DomButtonProps = {
  size: Size,
  variant: Variant,
  center: boolean,
  selected?: boolean,
  $iconOnly: boolean,
};

const perVariant = <T extends string | RuleSet>(variants: Record<Variant, T>) =>
  ({ variant }: DomButtonProps) => variants[variant];
const perSize = <T extends string | RuleSet>(sizes: Record<Size, T>) =>
  ({ size }: DomButtonProps) => sizes[size];

const BORDER_WIDTH = 1;

const DomButton = styled.button.withConfig({
  shouldForwardProp: prop => !['size', 'variant', 'center', 'selected'].includes(prop),
})<DomButtonProps>`
  display: flex;

  justify-content: ${({ center }) => center ? 'center' : 'space-between'};
  align-items: center;
  gap: ${perSize({
    large: vars('--spacing-s-nudge-2'),
    medium: vars('--spacing-s-nudge-2'),
    small: vars('--spacing-xs'),
    'extra-small': vars('--spacing-xs'),
    tiny: vars('--spacing-xxs'),
  })};
  
  padding: 0 ${({ $iconOnly }) => perSize({
    large: $iconOnly ? vars('--spacing-l-nudge') : vars('--spacing-xl'),
    medium: $iconOnly ? vars('--spacing-s') : vars('--spacing-l'),
    small: $iconOnly ? vars('--spacing-s-nudge-2') : vars('--spacing-m'),
    'extra-small': $iconOnly ? vars('--spacing-xxs') : vars('--spacing-s'),
    tiny: $iconOnly ? vars('--spacing-xxs') : vars('--spacing-xs'),
  })};
  height: ${perSize({
    large: '54px',
    medium: '40px',
    small: '32px',
    'extra-small': '24px',
    tiny: '20px',
  })};

  white-space: nowrap;

  ${perSize({
    large: typography.decorative.subtitle1,
    medium: typography.decorative.subtitle2,
    small: typography.decorative.body1Strong,
    'extra-small': typography.decorative.caption1Strong,
    tiny: typography.decorative.caption2Strong,
  })};
  border-radius: ${perSize({
    large: vars('--border-radius-s'),
    medium: vars('--border-radius-s'),
    small: vars('--border-radius-s'),
    'extra-small': vars('--border-radius-s'),
    tiny: vars('--border-radius-xs'),
  })};
  transition: background-color ${transitionTime}, color ${transitionTime};

  outline-offset: -${BORDER_WIDTH}px;
  
  ${({ selected }) => selected ? css<DomButtonProps>`
    border: ${perVariant({
      primary: 'none',
      secondary: `${BORDER_WIDTH}px solid ${vars('--color-brand-stroke-compound-rest')}`,
      outline: `${BORDER_WIDTH}px solid ${vars('--color-brand-stroke-compound-rest')}`,
      subtle: 'none',
      transparent: 'none',
      danger: 'none',
    })};
    color: ${perVariant({
      primary: vars('--color-neutral-foreground-on-brand-rest'),
      secondary: vars('--color-neutral-foreground-1-selected'),
      outline: vars('--color-neutral-foreground-1-selected'),
      subtle: vars('--color-neutral-foreground-1-selected'),
      transparent: vars('--color-neutral-foreground-2-brand-selected'),
      danger: vars('--color-neutral-foreground-static-inverted-rest'),
    })};
    outline: none;
    background-color: ${perVariant({
      primary: vars('--color-brand-background-1-selected'),
      secondary: vars('--color-brand-background-2-rest'),
      outline: vars('--color-brand-background-2-rest'),
      subtle: vars('--color-brand-background-2-rest'),
      transparent: 'transparent',
      danger: vars('--color-status-danger-background-3-selected'),
    })};
  ` : css<DomButtonProps>`
    border: ${perVariant({
      primary: 'none',
      secondary: `${BORDER_WIDTH}px solid ${vars('--color-neutral-stroke-1-rest')}`,
      outline: `${BORDER_WIDTH}px solid ${vars('--color-neutral-stroke-1-rest')}`,
      subtle: 'none',
      transparent: 'none',
      danger: 'none',
    })};
    color: ${perVariant({
      primary: vars('--color-neutral-foreground-on-brand-rest'),
      secondary: vars('--color-neutral-foreground-1-rest'),
      outline: vars('--color-neutral-foreground-1-rest'),
      subtle: vars('--color-neutral-foreground-1-rest'),
      transparent: vars('--color-neutral-foreground-1-rest'),
      danger: vars('--color-neutral-foreground-static-inverted-rest'),
    })};
    background-color: ${perVariant({
      primary: vars('--color-brand-background-1-rest'),
      secondary: vars('--color-neutral-background-1-rest'),
      outline: 'transparent',
      subtle: vars('--color-neutral-background-transparent-rest'),
      transparent: vars('--color-neutral-background-subtle-rest'),
      danger: vars('--color-status-danger-background-3-rest'),
    })};
  `}
    
  &:focus-visible {
    ${({ variant }) => variant === 'primary' ?
      // This is to make the dark outline more visible on dark background of the "primary" button variant
        css`box-shadow: inset 0 0 0 ${BORDER_WIDTH * 2}px ${vars('--color-neutral-stroke-focus-1-rest')};` :
        ''
    }
    border: ${perVariant({
      primary: 'none',
      secondary: `${BORDER_WIDTH}px solid transparent`,
      outline: `${BORDER_WIDTH}px solid transparent`,
      subtle: 'none',
      transparent: 'none',
      danger: `${BORDER_WIDTH}px solid transparent`,
    })};
    color: ${perVariant({
      primary: vars('--color-neutral-foreground-on-brand-rest'),
      secondary: vars('--color-neutral-foreground-1-pressed'),
      outline: vars('--color-neutral-foreground-1-pressed'),
      subtle: vars('--color-neutral-foreground-1-pressed'),
      transparent: vars('--color-neutral-foreground-2-brand-pressed'),
      danger: vars('--color-status-danger-background-3-pressed'),

    })};
    background-color: ${perVariant({
      primary: vars('--color-brand-background-1-rest'),
      secondary: vars('--color-neutral-background-1-rest'),
      outline: 'transparent',
      subtle: vars('--color-neutral-background-transparent-rest'),
      transparent: 'transparent',
      danger: vars('--color-status-danger-background-3-rest'),
    })};
    outline: ${perVariant({
      primary: `2px solid ${vars('--color-neutral-stroke-focus-2-rest')}`,
      secondary: `2px solid ${vars('--color-neutral-stroke-focus-2-rest')}`,
      outline: `2px solid ${vars('--color-neutral-stroke-focus-2-rest')}`,
      subtle: `2px solid ${vars('--color-neutral-stroke-focus-2-rest')}`,
      transparent: `2px solid ${vars('--color-neutral-stroke-focus-2-rest')}`,
      danger: `2px solid ${vars('--color-neutral-stroke-focus-2-rest')}`,
    })};
  }

  /* Devices supporting hover only. */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border: ${perVariant({
        primary: 'none',
        secondary: `${BORDER_WIDTH}px solid ${vars('--color-brand-stroke-compound-hover')}`,
        outline: `${BORDER_WIDTH}px solid ${vars('--color-brand-stroke-compound-hover')}`,
        subtle: 'none',
        transparent: 'none',
        danger: 'none',
      })};
      color: ${perVariant({
        primary: vars('--color-neutral-foreground-on-brand-rest'),
        secondary: vars('--color-neutral-foreground-1-hover'),
        outline: vars('--color-neutral-foreground-1-hover'),
        subtle: vars('--color-neutral-foreground-1-hover'),
        transparent: vars('--color-neutral-foreground-2-brand-hover'),
        danger: vars('--color-neutral-foreground-static-inverted-rest'),
      })};
      background-color: ${perVariant({
        primary: vars('--color-brand-background-1-hover'),
        secondary: vars('--color-neutral-background-1-hover'),
        outline: 'transparent',
        subtle: vars('--color-neutral-background-subtle-hover'),
        transparent: 'transparent',
        danger: vars('--color-status-danger-background-3-hover'),
      })};
    }
  }

  &:active {
    border: ${perVariant({
      primary: 'none',
      secondary: `${BORDER_WIDTH}px solid transparent`,
      outline: `${BORDER_WIDTH}px solid transparent`,
      subtle: 'none',
      transparent: 'none',
      danger: 'none',
    })};
    color: ${perVariant({
      primary: vars('--color-neutral-foreground-on-brand-rest'),
      secondary: vars('--color-neutral-foreground-1-pressed'),
      outline: vars('--color-neutral-foreground-1-pressed'),
      subtle: vars('--color-neutral-foreground-1-pressed'),
      transparent: vars('--color-neutral-foreground-2-brand-pressed'),
      danger: vars('--color-neutral-foreground-on-brand-rest'),
    })};
    background-color: ${perVariant({
      primary: vars('--color-brand-background-1-pressed'),
      secondary: vars('--color-neutral-background-1-pressed'),
      outline: 'transparent',
      subtle: vars('--color-neutral-background-subtle-pressed'),
      transparent: 'transparent',
      danger: vars('--color-status-danger-background-3-pressed'),
    })};        
    outline: ${perVariant({
      primary: 'none',
      secondary: `1px solid ${vars('--color-brand-stroke-compound-pressed')}`,
      outline: `1px solid ${vars('--color-brand-stroke-compound-pressed')}`,
      subtle: 'none',
      transparent: 'none',
      danger: 'none',
    })};
  }

  &:disabled {
    border: ${perVariant({
      primary: 'none',
      secondary: `1px solid ${vars('--color-neutral-stroke-disabled-rest')}`,
      outline: `1px solid ${vars('--color-neutral-stroke-disabled-rest')}`,
      subtle: 'none',
      transparent: 'none',
      danger: 'none',
    })};
    color: ${perVariant({
      primary: vars('--color-neutral-foreground-disabled-rest'),
      secondary: vars('--color-neutral-foreground-disabled-rest'),
      outline: vars('--color-neutral-foreground-disabled-rest'),
      subtle: vars('--color-neutral-foreground-disabled-rest'),
      transparent: vars('--color-neutral-foreground-disabled-rest'),
      danger: vars('--color-neutral-foreground-disabled-rest'),
    })};
    background-color: ${perVariant({
      primary: vars('--color-neutral-background-disabled-rest'),
      secondary: vars('--color-neutral-background-disabled-rest'),
      outline: 'transparent',
      subtle: 'transparent',
      transparent: 'transparent',
      danger: vars('--color-neutral-background-disabled-rest'),
    })};
    outline: none;
    cursor: not-allowed;
  }
`;

const LoadingIcon = styled(CIcon)`
  animation: spin 1.4s linear infinite;

  & *:first-of-type {
    fill: ${vars('--color-neutral-stroke-2-rest')};
  }

  & *:last-of-type {
    fill: ${vars('--color-neutral-stroke-1-rest')};
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
