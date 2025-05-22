import dayjs from 'dayjs';
import styled, { css } from 'styled-components';
import { Address } from 'viem';

import ChainIcon from 'src/domains/chains/components/ChainIcon';
import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import InfoPair from 'src/domains/misc/components/InfoPair';
import Modal from 'src/domains/misc/components/ModalNew';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import { Transactions } from 'src/domains/shielder/stores/getShielderIndexedDB';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import Steps, { StepData } from './Steps';
import Title from './Title';

type Props = {
  transaction: Transactions[number],
};

const TransactionDetailsModal = ({ transaction }: Props) => {
  const {
    symbolQuery: { data: tokenSymbol },
    decimalsQuery: { data: tokenDecimals },
  } = useTokenData(
    transaction.token.address ?
      { address: transaction.token.address as Address, isNative: false } :
      { isNative: true },
    ['symbol', 'decimals']
  );

  const { address } = useWallet();
  const chainConfig = useChain();
  const isPositive = transaction.type === 'Deposit';

  const formattedBalance =
    isPresent(tokenDecimals) && isPresent(transaction.amount) && transaction.type !== 'NewAccount' ?
      `${isPositive ? '+' : ''}${formatBalance({ balance: transaction.amount, decimals: tokenDecimals })} ${tokenSymbol}` :
      <NoBalance>N/A</NoBalance>;

  const steps: StepData[] = [
    { title: 'Submitted', timestamp: null, status: 'success' },
    { title: 'Pending', timestamp: null, status: 'success' },
    { title: 'Completed', timestamp: transaction.timestamp ? dayjs(transaction.timestamp).format('h:mm A') : null, status: 'success' },
  ];

  return (
    <Modal config={{
      title: <Title transaction={transaction} />,
      content: (
        <Wrapper>
          <Container>
            <Header>
              <TokenIcon address={null} size={40} />
              <TokenName>{tokenSymbol}</TokenName>
              <Balance $isPositive={isPositive}>{formattedBalance}</Balance>
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
                      {transaction.type === 'Deposit' ? <Text>{formatAddress(address)}</Text> : 'Shielded'}
                    </>
                  )}
                </RowValue>
              }
            />
            <InfoPair
              label="To"
              value={
                <RowValue>
                  <AccountTypeIcon size={20} type={transaction.type === 'Deposit' ? 'shielded' : 'public'} />
                  <p>{transaction.type === 'Deposit' ? 'Shielded' : 'Public'}</p>
                  {transaction.to && (
                    <>
                      <Divider />
                      <Text>{formatAddress(transaction.to)}</Text>
                    </>
                  )}
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
          </InfoPairs>
        </Wrapper>
      ),
    }}
    />
  );
};

export default TransactionDetailsModal;

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

const Balance = styled.p<{ $isPositive: boolean }>`
  margin-left: auto;
  ${typography.decorative.subtitle1};
  ${({ $isPositive }) =>
    $isPositive &&
    css`
      color: ${vars('--color-status-success-foreground-1-rest')};
    `}
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

const Text = styled.p`
  color: ${vars('--color-brand-foreground-1-rest')};
`;

const Divider = styled.div`
  height: 12px;
  width: 1px;
  background: ${vars('--color-neutral-stroke-2-rest')};
`;
