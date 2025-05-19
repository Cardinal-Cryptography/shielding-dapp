import styled, { css } from 'styled-components';
import { Address } from 'viem';

import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon.tsx';
import { useModal } from 'src/domains/misc/components/ModalNew';
import formatAddress from 'src/domains/misc/utils/formatAddress.ts';
import isPresent from 'src/domains/misc/utils/isPresent.ts';
import formatBalance from 'src/domains/numbers/utils/formatBalance.ts';
import TransactionDetails from 'src/domains/shielder/components/TransactionDetailsModal/TransactionDetails.tsx';
import { Transactions } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useTokenData from 'src/domains/shielder/utils/useTokenData.ts';
import { transitionTime, typography } from 'src/domains/styling/utils/tokens.ts';
import vars from 'src/domains/styling/utils/vars.ts';

import ActivityIcon from './ActivityIcon';

const CONFIG_BY_TYPE = {
  Deposit: {
    label: () => (
      <AccountLabel>
        <p>Shielded from</p>
        <AccountTypeIcon type="public" size={16} />
        <p>Public</p>
      </AccountLabel>
    ),
    name: (symbol?: string) => symbol,
  },
  Withdraw: {
    label: (to?: string) =>
      to ? <p>Sent privately to {formatAddress(to)}</p> : null,
    name: (symbol?: string) => symbol,
  },
  NewAccount: {
    label: () => <p>Account created</p>,
    name: () => 'Shielded account',
  },
} as const;

type Props = {
  transaction: Transactions[number],
};

const ActivityItem = ({ transaction }: Props) => {
  const { open } = useModal(<TransactionDetails transaction={transaction} />);
  const {
    symbolQuery: { data: tokenSymbol },
    decimalsQuery: { data: tokenDecimals },
    nameQuery: { data: tokenName },
  } = useTokenData(
    transaction.token.address ?
      { address: transaction.token.address as Address, isNative: false } :
      { isNative: true },
    ['symbol', 'decimals', 'name']
  );

  const { type, amount, to } = transaction;
  const { label, name } = CONFIG_BY_TYPE[type];

  const isPositive = type === 'Deposit';

  const formattedBalance =
    isPresent(tokenDecimals) && isPresent(amount) && type !== 'NewAccount' ?
      `${isPositive? '+' : ''}${formatBalance({ balance: amount, decimals: tokenDecimals })} ${tokenSymbol}` :
      <NoBalance>N/A</NoBalance>;

  return (
    <Container onClick={open} disabled={type === 'NewAccount'}>
      <ActivityIcon type={type} size={40} />
      <Info>
        <Label>{label(to)}</Label>
        <Title>{name(tokenName)}</Title>
      </Info>
      <Balance $isPositive={isPositive}>{formattedBalance}</Balance>
    </Container>
  );
};

export default ActivityItem;

const Container = styled.button`
  display: flex;

  align-items: center;
  gap: ${vars('--spacing-s')};

  width: 100%;
  padding: ${vars('--spacing-s')};

  border-radius: ${vars('--border-radius-s')};
  transition: background ${transitionTime};

  &:not(:disabled):hover {
    background: ${vars('--color-neutral-background-1a-hover')};
  }

  &:not(:disabled):active {
    background: ${vars('--color-neutral-background-1a-pressed')};
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.p`
  color: ${vars('--color-neutral-foreground-3-rest')};
  ${typography.web.caption2}
`;

const Title = styled.p`
  ${typography.decorative.subtitle2}
`;

const Balance = styled.p<{ $isPositive: boolean }>`
  margin-left: auto;
  ${typography.decorative.subtitle2};
  ${({ $isPositive }) =>
    $isPositive &&
    css`
      color: ${vars('--color-status-success-foreground-1-rest')};
    `}
`;

const NoBalance = styled.p`
  color: ${vars('--color-neutral-foreground-4-rest')}
`;

const AccountLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
`;
