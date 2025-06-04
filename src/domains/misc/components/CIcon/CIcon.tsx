import { ComponentProps, forwardRef } from 'react';
import styled from 'styled-components';

import { icons, IconName } from './icons';

type Size = number | `${string}%` | `${string}px`;

type Props = {
  icon: IconName,
  size?: Size,
  color?: string,
  strokeWidth?: number,
  className?: string,
} & ComponentProps<'svg'>;

const CIcon = forwardRef<SVGSVGElement, Props>(({
  icon,
  size = 24,
  color,
  strokeWidth = 0,
  className,
  ...props
}, ref) => {
  const IconComponent = icons[icon];

  return (
    <Icon
      ref={ref}
      as={IconComponent}
      $size={size}
      $color={color}
      $strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
});

CIcon.displayName = 'CIcon';

export default styled(CIcon)``;

const Icon = styled.div<{
  $size: Size,
  $color?: string,
  $strokeWidth: number,
}>`
  height: ${({ $size }) => (typeof $size === 'number' ? `${$size}px` : $size)};
  width: ${({ $size }) => (typeof $size === 'number' ? `${$size}px` : $size)};
  color: ${({ $color }) => $color ?? 'currentcolor'};

  flex-shrink: 0;

  & * {
    fill: currentcolor;
    stroke: currentcolor;
    stroke-width: ${({ $strokeWidth }) => $strokeWidth};
  }
`;
