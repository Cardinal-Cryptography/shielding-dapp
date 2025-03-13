import { ComponentProps, forwardRef, type ReactElement } from 'react';
import styled, { RuleSet } from 'styled-components';

import CIcon, { IconName } from 'src/domains/misc/components/CIcon';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Size = 'medium' | 'large';
type Design = 'filled' | 'tint' | 'outline';
type Variant = 'success' | 'brand' | 'informative' | 'danger' | 'warning' | 'severe-warning' | 'subtle';
type IconSide = 'none' | 'left' | 'right' | 'both';

type Props = {
  text?: string,
  size: Size,
  variant: Variant,
  leftIcon?: IconName | ReactElement,
  rightIcon?: IconName | ReactElement,
  iconColor?: string,
  design: Design,
  circular?: boolean,
} & ComponentProps<'button'>;

const Badge = forwardRef<HTMLButtonElement, Props>(({
  text,
  size,
  variant,
  leftIcon,
  rightIcon,
  iconColor,
  design,
  circular,
  ...props
}, ref) => {
  const iconSide = (leftIcon && rightIcon) ? 'both' : leftIcon ? 'left' : rightIcon ? 'right' : 'none';

  return (
    <StyledBadge
      size={size}
      variant={variant}
      design={design}
      circular={circular}
      ref={ref}
      $isSquare={!text || (text.length === 1 && (!leftIcon && !rightIcon))}
      {...props}
    >
      {typeof leftIcon === 'string' ? (
        <StyledCIcon variant={variant} design={design} size={size} icon={leftIcon} color={iconColor} />
      ) : leftIcon}
      {text && (
        <BadgeText
          $iconSide={iconSide}
          size={size}
          variant={variant}
          design={design}
        >
          {text}
        </BadgeText>
      )}
      {typeof rightIcon ==='string' ? (
        <StyledCIcon variant={variant} design={design} size={size} icon={rightIcon} color={iconColor} />
      ): rightIcon}
    </StyledBadge>
  );
});

export default Badge;

const perDesign =
    <T extends (({ variant }: Props) => string) | string>(designs: Record<Design, T>) =>
      ({ design }: Props) =>
        designs[design];

const perSize =
    <T extends string | RuleSet>(sizes: Record<Size, T>) =>
      ({ size }: Props) =>
        sizes[size];

const perVariant =
    <T extends string | RuleSet>(variants: Record<Variant, T>) =>
      ({ variant }: Props) =>
        variants[variant];

const StyledBadge = styled.div.withConfig({
  shouldForwardProp: prop => !['size', 'variant', 'design', 'circular'].includes(prop),
})<Props & { $isSquare: boolean }>`
  display: flex;

  justify-content: center;
  align-items: center;
  gap: ${perSize({
    medium: vars('--spacing-xxs'),
    large: vars('--spacing-xxs'),
  })};

  height: ${perSize({
    medium: vars('--spacing-xl'),
    large: '24px',
  })};
  width: ${({ $isSquare }) => perSize({
    medium: $isSquare ? vars('--spacing-xl') : 'auto',
    large: $isSquare ? '24px' : 'auto',
  })};
  min-width: fit-content;
  border: ${perDesign({
    filled: '0px',
    tint: '1px solid',
    outline: '1px solid',
  })};
  padding-inline: ${vars('--spacing-xs')};

  color: ${perDesign({
    filled: perVariant<string>({
      brand: vars('--color-neutral-foreground-on-brand-rest'),
      success: vars('--color-neutral-foreground-static-inverted-rest'),
      informative: vars('--color-neutral-foreground-3-rest'),
      danger: vars('--color-neutral-foreground-static-inverted-rest'),
      warning: vars('--color-neutral-foreground-static-rest'),
      'severe-warning': vars('--color-neutral-foreground-static-inverted-rest'),
      subtle: vars('--color-neutral-foreground-1-rest'),
    }),
    tint: perVariant<string>({
      brand: vars('--color-brand-foreground-2-rest'),
      success: vars('--color-status-success-foreground-1-rest'),
      informative: vars('--color-neutral-foreground-3-rest'),
      danger: vars('--color-status-danger-foreground-1-rest'),
      warning: vars('--color-status-warning-foreground-2-rest'),
      'severe-warning': vars('--color-status-warning-foreground-2-rest'),
      subtle: vars('--color-neutral-foreground-3-rest'),
    }),
    outline: perVariant<string>({
      brand: vars('--color-brand-foreground-2-rest'),
      success: vars('--color-status-success-foreground-1-rest'),
      informative: vars('--color-neutral-foreground-3-rest'),
      danger: vars('--color-status-danger-foreground-1-rest'),
      warning: vars('--color-status-warning-foreground-2-rest'),
      'severe-warning': vars('--color-status-warning-foreground-2-rest'),
      subtle: vars('--color-neutral-foreground-3-rest'),
    }),
  })};

  border-radius: ${({ circular }) =>
    circular ? vars('--border-radius-circular') : '4px'};
  border-color: ${perDesign({
    filled: perVariant<string>({
      brand: 'none',
      success: 'none',
      informative: 'none',
      danger: 'none',
      warning: 'none',
      'severe-warning': 'none',
      subtle: 'none',
    }),
    tint: perVariant<string>({
      brand: vars('--color-brand-stroke-2-rest'),
      success: vars('--color-status-success-stroke-1-rest'),
      informative: vars('--color-neutral-stroke-1-rest'),
      danger: vars('--color-status-danger-stroke-1-rest'),
      warning: vars('--color-status-warning-stroke-1-rest'),
      'severe-warning': vars('--color-status-severe-stroke-1-rest'),
      subtle: vars('--color-neutral-stroke-2-rest'),
    }),
    outline: perVariant<string>({
      brand: vars('--color-brand-stroke-2-rest'),
      success: vars('--color-status-success-stroke-1-rest'),
      informative: vars('--color-neutral-stroke-1-rest'),
      danger: vars('--color-status-danger-stroke-1-rest'),
      warning: vars('--color-status-warning-stroke-1-rest'),
      'severe-warning': vars('--color-status-severe-stroke-1-rest'),
      subtle: 'transparent',
    }),
  })};
  background: ${perDesign({
    filled: perVariant<string>({
      brand: vars('--color-brand-background-1-rest'),
      success: vars('--color-status-success-background-3-rest'),
      informative: vars('--color-neutral-background-5-rest'),
      danger: vars('--color-status-danger-background-3-rest'),
      warning: vars('--color-status-warning-background-3-rest'),
      'severe-warning': vars('--color-status-severe-background-3-rest'),
      subtle: vars('--color-neutral-background-1-rest'),
    }),
    tint: perVariant<string>({
      brand: vars('--color-brand-background-2-rest'),
      success: vars('--color-status-success-background-1-rest'),
      informative: vars('--color-neutral-background-4-rest'),
      danger: vars('--color-status-danger-background-1-rest'),
      warning: vars('--color-status-warning-background-1-rest'),
      'severe-warning': vars('--color-status-severe-background-1-rest'),
      subtle: vars('--color-neutral-background-1-rest'),
    }),
    outline: perVariant<string>({
      brand: 'transparent',
      success: 'transparent',
      informative: 'transparent',
      danger: 'transparent',
      warning: 'transparent',
      'severe-warning': 'transparent',
      subtle: 'transparent',
    }),
  })};
`;

const StyledCIcon = styled(CIcon).withConfig({
  shouldForwardProp: prop => !['size', 'variant', 'design'].includes(prop),
})<Props>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${perSize({
    medium: vars('--spacing-m'),
    large: vars('--spacing-l'),
  })};
  width: ${perSize({
    medium: vars('--spacing-m'),
    large: vars('--spacing-l'),
  })};
`;

const BadgeText = styled.span.withConfig({
  shouldForwardProp: prop => !['size', 'variant', 'design'].includes(prop),
})<Props & { $iconSide: IconSide }>`
  padding-inline: ${({ $iconSide }) =>
    perSize({
      medium: $iconSide === 'none' ? vars('--spacing-xs-nudge') : $iconSide === 'both' ? '0' :
      ($iconSide === 'left' ? `0 ${vars('--spacing-xs-nudge')}` : `${vars('--spacing-xs-nudge')} 0`),
      large: $iconSide === 'none' ? vars('--spacing-xs') : $iconSide === 'both' ? '0' :
      ($iconSide === 'left' ? `0 ${vars('--spacing-xs')}` : `${vars('--spacing-xs')} 0`),
    })};
  text-align: center;
  ${perSize({
    medium: typography.web.caption2,
    large: typography.web.caption1,
  })};
  line-height: 100%;
`;
