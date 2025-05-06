import styled from 'styled-components';

import { icons, IconName } from './icons';

type Size = number | `${string}%` | `${string}px`;

type Props = {
  icon: IconName,
  size?: Size,
  color?: string,
  strokeWidth?: number,
  className?: string,
};

const CIcon = ({
  icon,
  size = 24,
  color,
  strokeWidth = 0,
  className,
}: Props) => {
  const IconComponent = icons[icon];

  return (
    <Icon
      as={IconComponent}
      $size={size}
      $color={color}
      $strokeWidth={strokeWidth}
      className={className}
    />
  );
};

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
