import styled from 'styled-components';
import { useAccount } from 'wagmi';

import CheckmarkChecked from 'src/domains/misc/assets/checkmarkChecked.svg?react';
import CheckmarkUnchecked from 'src/domains/misc/assets/checkmarkUnchecked.svg?react';
import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import CIcon from 'src/domains/misc/components/CIcon';
import CopyButton from 'src/domains/misc/components/CopyButton';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import useShielderStore from 'src/domains/shielder/stores/shielder';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { BALANCE_TYPES_DATA } from './consts';
const AccountTypeSelector = () => {
  const { chainId, address } = useAccount();
  const { selectedAccountType, setSelectedAccountType } = useShielderStore();

  return (
    <BalanceCard>
      {BALANCE_TYPES_DATA.map(({ name, type }) => {
        const selected = selectedAccountType === type;

        return (
          <BalanceItem
            key={type}
            onClick={() => void setSelectedAccountType(type)}
            $selected={selected}
          >
            <BalanceName>
              {selected ? <Checked /> : <Unchecked />}
              <Details>
                <AccountTypeIcon type={type} size={32} chainId={chainId} />
                {name}
              </Details>
            </BalanceName>
            <AdditionalInfo>
              {type === 'public' ? address && (
                <Address data={address} size={20}>
                  {formatAddress(address)}
                </Address>
              ) : <CIcon size={20} icon="ArrowTurnDownLeft" />}
            </AdditionalInfo>
          </BalanceItem>
        );
      })}
    </BalanceCard>
  );
};

export default AccountTypeSelector;

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

  border-radius: ${vars('--border-radius-m')};
`;

const BalanceItem = styled.div<{ $selected?: boolean }>`
  display: flex;

  justify-content: space-between;
  align-items: center;

  height: 52px;
  width: 100%;
  padding-inline: ${vars('--spacing-s')};

  color: ${vars('--color-neutral-foreground-3-rest')};
  font-weight: 500;

  border-radius: ${vars('--border-radius-m-nudge')};
  background: ${({ $selected }) =>
    $selected ?
      vars('--color-neutral-background-1-selected') :
      vars('--color-neutral-background-3a-rest')};
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: ${vars('--color-neutral-background-1-selected')};
  }
`;

const BalanceName = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xxs')};
  ${typography.web.body1Strong};
  background: inherit;
`;

const AdditionalInfo = styled.p`
  display: flex;
  align-items: center;
  padding-right: ${vars('--spacing-l')};
`;

const Checked = styled(CheckmarkChecked)`
  margin: 8px;
`;

const Unchecked = styled(CheckmarkUnchecked)`
  margin: 8px;
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-m')};
  background: inherit;
`;

const Address = styled(CopyButton)`
  ${typography.web.caption1};
  gap: ${vars('--spacing-xs')};
`;
