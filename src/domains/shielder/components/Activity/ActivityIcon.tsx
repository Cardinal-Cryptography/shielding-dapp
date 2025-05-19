import styled, { css } from 'styled-components';

import CIcon, { IconName } from 'src/domains/misc/components/CIcon';
import { Transactions } from 'src/domains/shielder/stores/getShielderIndexedDB';
import vars from 'src/domains/styling/utils/vars';

const ICONS_BY_TYPE: Record<Transactions[number]['type'], IconName> = {
  Deposit: 'ShieldedFilled',
  Withdraw: 'ArrowUpRight',
  NewAccount: 'AddCircle',
} as const;

type Props = {
  type: keyof typeof ICONS_BY_TYPE,
  size: number,
  className?: string,
};

const AccountTypeIcon = ({ type, size, className }: Props) => (
  <Wrapper>
    <IconWrapper className={className} $size={size}>
      <CIcon
        icon={ICONS_BY_TYPE[type]}
        size={size / 1.6}
      />
    </IconWrapper>
    {type === 'Withdraw' && (
      <AdditionalIconWrapper className={className}>
        <CIcon icon="ShieldedFilled" size={size / 2.4} />
      </AdditionalIconWrapper>
    )}
  </Wrapper>
);

export default styled(AccountTypeIcon)``;

const IconWrapper = styled.div<{ $size: number, $withBorder?: boolean }>`
  display: grid;

  position: relative;

  place-items: center;
  
  height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};


  color: ${vars('--color-neutral-foreground-1-rest')};



  border-radius: ${vars('--border-radius-circular')};
  background: ${vars('--color-neutral-background-4a-rest')};



  ${({ $withBorder }) => $withBorder && css`
    border: 1px solid ${vars('--color-neutral-stroke-subtle-rest')};
  `}
`;

const AdditionalIconWrapper = styled.div`
  display: flex;

  position: absolute;
  top: calc(${vars('--spacing-xxs')} * -1);
  left: calc(${vars('--spacing-xxs')} * -1);

  padding: ${vars('--spacing-xxs-nudge')};
  border: ${vars('--spacing-xxs')} solid ${vars('--color-neutral-background-2-rest')};

  color: ${vars('--color-brand-background-1-rest')};

  border-radius: ${vars('--border-radius-circular')};
  background: ${vars('--color-neutral-background-4a-rest')};

  aspect-ratio: 1/1;
  
`;

const Wrapper = styled.div`
  position: relative;
  background: inherit;
`;
