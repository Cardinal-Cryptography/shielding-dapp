import styled, { css, type RuleSet } from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import vars from 'src/domains/styling/utils/vars';

type Size = 'extra-small' | 'small' | 'medium' | 'large';

type Props = {
  type: 'public' | 'shielded',
  size: Size,
  className?: string,
  withBorder?: boolean,
};

const AccountTypeIcon = ({ type, size, className, withBorder }: Props) => (
  <IconWrapper className={className} $size={size} $withBorder={withBorder}>
    <CIcon
      icon={type === 'public' ? 'PersonFilled' : 'ShieldedFilled'}
      size={ICON_SIZE[size]}
    />
  </IconWrapper>
);

export default styled(AccountTypeIcon)``;

const ICON_SIZE = {
  'extra-small': 12,
  small: 16,
  medium: 16,
  large: 20,
} satisfies Record<Size, number>;

const perSize = <T extends string | RuleSet>(sizes: Record<Size, T>) =>
  ({ $size }: { $size: Size }) => sizes[$size];

const IconWrapper = styled.div<{ $size: Size, $withBorder?: boolean }>`
  display: grid;
  place-items: center;
  color: ${vars('--color-neutral-foreground-static-rest')};
  border-radius: ${vars('--border-radius-circular')};
  background: linear-gradient(135deg, #cce0ff 0%, #6fa1eb 100%);
  
  ${({ $withBorder }) => $withBorder && css`
    border: 1px solid ${vars('--color-neutral-stroke-subtle-rest')};
  `}
  
  ${perSize({
    'extra-small': css`
      height: 16px;
      width: 16px;
    `,
    small: css`
      height: 20px;
      width: 20px;
    `,
    medium: css`
      height: 24px;
      width: 24px;
    `,
    large: css`
      height: 32px;
      width: 32px;
    `,
  })}
`;
