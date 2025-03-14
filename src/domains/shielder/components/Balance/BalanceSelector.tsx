import styled from 'styled-components';
import { isNullish } from 'utility-types';

import CheckmarkChecked from 'src/domains/misc/assets/checkmarkChecked.svg?react';
import CheckmarkUnchecked from 'src/domains/misc/assets/checkmarkUnchecked.svg?react';
import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import Skeleton from 'src/domains/misc/components/Skeleton';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { type BalanceType, BALANCE_TYPES_DATA } from './consts';

type Props = {
  selectedBalance: BalanceType,
  setSelectedBalance: (key: BalanceType) => void,
  publicBalanceUsdValue: string | undefined,
  privateBalanceUsdValue: string | undefined,
};

const BalanceSelector = ({
  selectedBalance,
  setSelectedBalance,
  publicBalanceUsdValue,
  privateBalanceUsdValue,
}: Props) => (
  <BalanceCard>
    {BALANCE_TYPES_DATA.map(({ name, type }) => {
      const selected = selectedBalance === type;
      const balance = {
        public: publicBalanceUsdValue,
        shielded: privateBalanceUsdValue,
      }[type];

      return (
        <BalanceItem
          key={type}
          onClick={() => void setSelectedBalance(type)}
          $selected={selected}
        >
          <BalanceName>
            {selected ? <Checked /> : <Unchecked />}
            <AccountTypeIcon type={type} size="small" />
            {name}
          </BalanceName>
          <BalanceValue>
            <Skeleton
              style={{ height: 18, width: 42 }}
              loading={isNullish(balance)}
            >
              ${balance}
            </Skeleton>
          </BalanceValue>
        </BalanceItem>
      );
    })}
  </BalanceCard>
);

export default BalanceSelector;

const BalanceCard = styled.div`
  display: flex;

  flex-direction: column;
  gap: ${vars('--spacing-xs')};

  width: 100%;
  max-width: 540px;
  padding: ${vars('--spacing-l')};
  padding: ${vars('--spacing-xs')};
  margin-inline: auto;
  border: ${vars('--spacing-xxs-nudge')} solid ${vars('--color-neutral-stroke-2-rest')};

  border-radius: ${vars('--border-radius-s')};
`;

const BalanceItem = styled.button<{ $selected?: boolean }>`
  display: flex;

  justify-content: space-between;
  align-items: center;

  height: 40px;
  width: 100%;
  padding-inline: ${vars('--spacing-s')};

  color: ${vars('--color-neutral-foreground-3-rest')};
  font-weight: 500;

  border-radius: ${vars('--border-radius-xs')};
  background: ${({ $selected }) =>
    $selected ?
      vars('--color-neutral-background-1-selected') :
      'transparent'};
  transition: background 0.2s;

  &:hover {
    background: ${vars('--color-neutral-background-1-selected')};
  }
`;

const BalanceName = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  ${typography.web.body1Strong};
`;

const BalanceValue = styled.p`
  ${typography.web.body1};
`;

const Checked = styled(CheckmarkChecked)`
  margin: 8px;
`;

const Unchecked = styled(CheckmarkUnchecked)`
  margin: 8px;
`;
