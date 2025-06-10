import styled, { css } from 'styled-components';
import { Address } from 'viem';

import ChainIcon from 'src/domains/chains/components/ChainIcon';
import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import CIcon from 'src/domains/misc/components/CIcon';
import InfoPair from 'src/domains/misc/components/InfoPair';
import Modal from 'src/domains/misc/components/Modal';
import { useToast } from 'src/domains/misc/components/Toast';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import handleCopy from 'src/domains/misc/utils/handleCopy';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import { PartialLocalShielderActivityHistory } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useShielderStore from 'src/domains/shielder/stores/shielder';
import { useActivity } from 'src/domains/shielder/utils/useActivityHistory';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import Steps, { StepData } from './Steps';
import Title from './Title';
type Status = NonNullable<PartialLocalShielderActivityHistory['status'] | 'stale'>;

type Props = {
  txHash: Address,
} | {
  localId: string,
};

const ActivityDetailsModal = (props: Props) => {
  const { data: transaction } = useActivity(props);
  const { selectedAccountType } = useShielderStore();
  const { showToast } = useToast();

  const {
    symbolQuery: { data: tokenSymbol },
    decimalsQuery: { data: tokenDecimals },
  } = useTokenData(
    transaction?.token?.type === 'erc20' ?
      { address: transaction.token.address, isNative: false } :
      { isNative: true },
    ['symbol', 'decimals']
  );

  const {
    symbolQuery: { data: feeSymbol },
    decimalsQuery: { data: feeDecimals },
  } = useTokenData(
    transaction?.fee && transaction.fee.address !== 'native' ?
      { address: transaction.fee.address, isNative: false } :
      { isNative: true },
    ['symbol', 'decimals']
  );
  const { address } = useWallet();
  const chainConfig = useChain();

  // Return null if transaction is not found (after all hooks)
  if (!transaction) {
    return null;
  }

  const isPositive = selectedAccountType === 'shielded' && transaction.type === 'Deposit';

  const formattedBalance =
    isPresent(tokenDecimals) && isPresent(transaction.amount) ?
      `${isPositive ? '+' : '-'}${formatBalance({ balance: transaction.amount, decimals: tokenDecimals })}` :
      <NoBalance>N/A</NoBalance>;

  const transactionDuration = (transaction.completedTimestamp && transaction.submitTimestamp) ?
    transaction.completedTimestamp - transaction.submitTimestamp :
    undefined;

  const getCompletedStep = () => {
    if (transaction.status === 'completed') return {
      title: 'Completed',
      timestamp: transaction.completedTimestamp,
      status: 'success' ,
    } as const;
    if (transaction.status === 'failed') return {
      title: 'Failed',
      timestamp: transaction.completedTimestamp,
      status: 'failed' ,
    } as const;
    return {
      title: transaction.submitTimestamp ? 'Completed' : 'Pending',
      timestamp: transaction.completedTimestamp,
      status: transaction.submitTimestamp ? 'stale' : 'pending',
    } as const;
  };

  const blockExplorerUrl = chainConfig?.blockExplorers?.default.url;
  const isSentToOwnAccount = !transaction.to || transaction.to === address;

  const steps: StepData[] =
    transaction.submitTimestamp ?
      [
        {
          title: 'Submitted',
          timestamp: transaction.submitTimestamp,
          status: 'success',
        },
        {
          title: 'Pending',
          duration: transactionDuration,
          status: transaction.status === 'pending' ? 'pending' : 'success',
        },
        getCompletedStep(),
      ] :
      [getCompletedStep()];

  const copy = (text: string | undefined, label: string) =>
    handleCopy(text, () => showToast({ status: 'success', title: `${label} copied`, ttlMs: 2000 }));

  return (
    <Modal config={{
      title: <Title transaction={transaction} />,
      content: (
        <Wrapper>
          <Container>
            <Header>
              <TokenIcon address={transaction.token?.type === 'erc20' ? transaction.token.address : null} size={40} />
              <TokenName>{tokenSymbol}</TokenName>
              <Balance $isPositive={isPositive} $status={transaction.status ?? 'stale'}>{formattedBalance}</Balance>
            </Header>
            <Steps steps={steps} />
          </Container>
          <InfoPairs>
            <InfoPair
              label="From"
              value={
                <RowValue>
                  <AccountTypeIcon size={20} type={transaction.type === 'Deposit' ? 'public' : 'shielded'} />
                  <p>{transaction.type === 'Deposit' ? 'Public' : 'Shielded'}</p>
                  {address && (
                    <>
                      <Divider />
                      <Text>
                        {transaction.type === 'Deposit' ? (
                          <button onClick={() => void copy(address, 'Account address')}>
                            {formatAddress(address)}
                          </button>
                        ) : 'Shielded'}
                      </Text>
                    </>
                  )}
                </RowValue>
              }
            />
            <InfoPair
              label="To"
              value={
                <RowValue>
                  {isSentToOwnAccount && (
                    <>
                      <AccountTypeIcon size={20} type={transaction.type === 'Deposit' ? 'shielded' : 'public'} />
                      <p>{transaction.type === 'Deposit' ? 'Shielded' : 'Public'}</p>
                      <Divider />
                    </>
                  )}
                  <Text>
                    {transaction.to ? (
                      <button onClick={() => void copy(transaction.to, 'Account address')}>
                        {formatAddress(transaction.to)}
                      </button>
                    ) : 'Shielded'}
                  </Text>
                </RowValue>
              }
            />
            {chainConfig && (
              <InfoPair
                label="Network"
                value={
                  <RowValue>
                    <ChainIcon chainId={chainConfig.id} />
                    {chainConfig.name}
                  </RowValue>
                }
              />
            )}
            {transaction.fee && isPresent(feeDecimals) && (
              <InfoPair
                tooltipText="Cost of processing your transaction on the blockchain."
                label={transaction.type === 'Withdraw' ? 'Transaction fee' : 'Network fee'}
                value={
                  <Fee>
                    <TokenIcon
                      {...(transaction.fee.address !== 'native' ?
                        { address: transaction.fee.address } :
                        { Icon: chainConfig?.NativeTokenIcon }
                      )}
                    />
                    {formatBalance({ balance: transaction.fee.amount, decimals: feeDecimals })}
                    {' '}
                    {feeSymbol}
                  </Fee>
                }
              />
            )}
            {transaction.txHash && (
              <InfoPair
                label="Transaction ID"
                value={
                  <TransactionId>
                    <button onClick={() => void copy(transaction.txHash, 'Transaction ID')}>
                      {formatAddress(transaction.txHash)}
                    </button>
                    {blockExplorerUrl && (
                      <a href={`${blockExplorerUrl}/tx/${transaction.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CIcon icon="Open" size={20} />
                      </a>
                    )}
                  </TransactionId>
                }
              />
            )}
          </InfoPairs>
        </Wrapper>
      ),
    }}
    />
  );
};

export default ActivityDetailsModal;

// Styled-components (same as original, minus the ones moved to extracted files)
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-m')};
  margin-inline: calc(${vars('--spacing-s')} * -1);
`;

const Container = styled.div`
  padding: ${vars('--spacing-s')};
  background: ${vars('--color-neutral-background-4a-rest')};
  border-radius: ${vars('--spacing-xxl')};
`;

const Header = styled.header`
  display: grid;

  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: ${vars('--spacing-m')};

  padding-left: ${vars('--spacing-xs')};
  padding-right: ${vars('--spacing-m')};
  padding-block: ${vars('--spacing-m')};
`;

const TokenName = styled.h2`
  ${typography.decorative.subtitle1}
`;

const Balance = styled.p<{ $isPositive: boolean, $status: Status }>`
  margin-left: auto;
  ${typography.decorative.subtitle1};
  ${({ $isPositive, $status }) => {
    if ($isPositive) {
      if ($status === 'completed') {
        return css`
          color: ${vars('--color-status-success-foreground-1-rest')};
        `;
      }
      if ($status === 'failed') {
        return css`
          color: ${vars('--color-status-success-foreground-1-rest')};
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
          color: ${vars('--color-neutral-foreground-1-rest')};
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

const NoBalance = styled.p`
  color: ${vars('--color-neutral-foreground-4-rest')}
`;

const InfoPairs = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-m')};
  padding-inline: ${vars('--spacing-s')};
`;

const RowValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  ${typography.web.body1};
`;

const TransactionId = styled.div`
  display: flex;
  align-items: center;
  color: ${vars('--color-brand-foreground-1-rest')};
  ${typography.web.body1};
  
  & > a {
    display: flex;
  }
`;

const Fee = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  ${typography.web.body1};
`;

const Text = styled.p`
  color: ${vars('--color-brand-foreground-1-rest')};
`;

const Divider = styled.div`
  height: 12px;
  width: 1px;
  background: ${vars('--color-neutral-stroke-2-rest')};
`;
