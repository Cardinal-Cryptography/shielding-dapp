import styled, { css, RuleSet } from 'styled-components';

import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import { PartialLocalShielderActivityHistory } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useActivityModal from 'src/domains/shielder/utils/useActivityModal';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import { transitionTime, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import ActivityIcon from '../ActivityIcon';

type Status = NonNullable<PartialLocalShielderActivityHistory['status'] | 'stale'>;
type TransactionType = PartialLocalShielderActivityHistory['type'];

const getTransactionLabel = (
  type: TransactionType,
  status: Status,
  to?: string
) => {
  switch (type) {
    case 'Deposit': {
      const depositText = status === 'failed' ? 'Shielding failed' :
        status === 'pending' ? 'Shielding' : 'Shielded';
      return (
        <AccountLabel>
          <div><ActivityType $status={status}>{depositText}</ActivityType> from</div>
          <AccountTypeIcon type="public" size={16} />
          <span>Public</span>
        </AccountLabel>
      );
    }
    case 'Withdraw':
      if (status === 'failed' || status === 'pending') {
        return (
          <ActivityType $status={status}>
            {status === 'failed' ? 'Sending privately failed' : 'Sending privately'}
          </ActivityType>
        );
      }
      return to ? <>Sent privately to {formatAddress(to)}</> : null;
    case 'NewAccount':
      return <span>Account created</span>;
    default:
      return null;
  }
};

const getTransactionTitle = (type: TransactionType, tokenName?: string) => {
  if (type === 'NewAccount') {
    return 'Shielded account';
  }
  return tokenName;
};

const getBalanceDisplay = (
  type: TransactionType,
  amount?: bigint,
  tokenDecimals?: number,
  tokenSymbol?: string
) => {
  if (type === 'NewAccount' || !isPresent(tokenDecimals) || !isPresent(amount)) {
    return <NoBalance>N/A</NoBalance>;
  }

  const isPositive = type === 'Deposit';
  const sign = isPositive ? '+' : '-';
  const formattedAmount = formatBalance({ balance: amount, decimals: tokenDecimals });

  return `${sign}${formattedAmount} ${tokenSymbol}`;
};

type Props = {
  transaction: PartialLocalShielderActivityHistory,
};

const ActivityItem = ({ transaction }: Props) => {
  const { openTransactionModal } = useActivityModal();
  const {
    symbolQuery: { data: tokenSymbol },
    decimalsQuery: { data: tokenDecimals },
    nameQuery: { data: tokenName },
  } = useTokenData(
    transaction.token?.type === 'erc20' ?
      { address: transaction.token.address, isNative: false } :
      { isNative: true },
    ['symbol', 'decimals', 'name']
  );

  const { type = 'Deposit', amount, to, status = 'stale' } = transaction;

  const label = getTransactionLabel(type, status, to);
  const title = getTransactionTitle(type, tokenName);
  const balanceDisplay = getBalanceDisplay(type, amount, tokenDecimals, tokenSymbol);
  const isPositive = type === 'Deposit';

  const handleClick = () => {
    const identifier = transaction.txHash ?
      { txHash: transaction.txHash } :
      { localId: transaction.localId };

    void openTransactionModal(identifier);
  };

  return (
    <Container
      onClick={handleClick}
      disabled={type === 'NewAccount'}
    >
      <ActivityIcon type={type} size={40} status={status} />
      <Info>
        <Label>{label}</Label>
        <Title>{title}</Title>
      </Info>
      <Balance $isPositive={isPositive} $status={status}>{balanceDisplay}</Balance>
    </Container>
  );
};

export default ActivityItem;

const perStatus = <T extends string | RuleSet>(statuses: Record<Status, T>) =>
  ({ $status }: { $status: Status }) => statuses[$status];

const Container = styled.button`
  display: flex;

  align-items: center;
  gap: ${vars('--spacing-s')};

  width: 100%;
  padding: ${vars('--spacing-s')};

  border-radius: ${vars('--border-radius-s')};
  transition: background ${transitionTime};
  
  &:disabled {
    cursor: default;
  }

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

const Label = styled.div`
  color: ${vars('--color-neutral-foreground-3-rest')};
  ${typography.web.caption2}
`;

const Title = styled.div`
  ${typography.decorative.subtitle2}
`;

const Balance = styled.div<{ $isPositive: boolean, $status: Status }>`
  margin-left: auto;
  ${typography.decorative.subtitle2};
  
  ${({ $isPositive, $status }) => {
    if ($isPositive) {
      if ($status === 'completed') {
        return css`
          color: ${vars('--color-status-success-foreground-1-rest')};
        `;
      }
      if ($status === 'failed') {
        return css`
          color: ${vars('--color-neutral-foreground-4-rest')};

          text-decoration: line-through;
        `;
      }
      if ($status === 'pending') {
        return css`
          color: ${vars('--color-neutral-foreground-4-rest')};
        `;
      }
    } else {
      if ($status === 'completed') {
        return css`
          color: ${vars('--color-neutral-foreground-1-rest')};
        `;
      }
      if ($status === 'failed') {
        return css`
          color: ${vars('--color-neutral-foreground-4-rest')};

          text-decoration: line-through;
        `;
      }
      if ($status === 'pending') {
        return css`
          color: ${vars('--color-neutral-foreground-4-rest')};
        `;
      }
    }

    return css`
      color: ${vars('--color-neutral-foreground-1-rest')};
    `;
  }}
`;

const NoBalance = styled.div`
  color: ${vars('--color-neutral-foreground-4-rest')}
`;

const AccountLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
`;

const ActivityType = styled.span<{ $status: Status }>`
  color: ${perStatus({
    failed: vars('--color-status-danger-foreground-1-rest'),
    pending: vars('--color-neutral-foreground-3-rest'),
    completed: vars('--color-neutral-foreground-3-rest'),
    stale: vars('--color-neutral-foreground-1-rest'),
  })}
`;
