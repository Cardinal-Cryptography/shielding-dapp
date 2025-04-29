import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';
import styled from 'styled-components';
import { Address } from 'viem';

import ChainIcon from 'src/domains/chains/components/ChainIcon';
import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import Badge from 'src/domains/misc/components/Badge';
import CIcon from 'src/domains/misc/components/CIcon';
import InfoPair from 'src/domains/misc/components/InfoPair';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import useTransactionsHistory from 'src/domains/shielder/utils/useTransactionsHistory';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import ChainActions from './ChainActions';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isTomorrow);

type Transaction = NonNullable<ReturnType<typeof useTransactionsHistory>['data']>[number];
type Props = {
  selectedTransaction: Transaction,
};

const shortenTxString = (hexString: string) => hexString.length > 10 ? `${hexString.slice(0, 6)}...${hexString.slice(-4)}` : hexString;

const formatTimestamp = (timestamp: number): string => {
  const date = dayjs(timestamp);
  const time = date.format('h:mm A');

  if (date.isToday()) return `Today • ${time}`;
  if (date.isTomorrow()) return `Tomorrow • ${time}`;
  if (date.isYesterday()) return `Yesterday • ${time}`;

  return `${date.format('MMM D, YYYY')} • ${time}`;
};

const RecordPreview = ({ selectedTransaction }: Props) => {
  const tokenAddress = selectedTransaction.token.address;
  const token = tokenAddress ?
    { address: tokenAddress as Address, isNative: false as const } :
    { isNative: true as const };
  const chainConfig = useChain();
  const {
    symbolQuery: { data: symbol },
    decimalsQuery: { data: decimals },
  } = useTokenData(tokenAddress ? { address: tokenAddress as Address, isNative: false } : { isNative: true });
  const { address } = useWallet();

  const isShielded = selectedTransaction.type === 'Deposit';

  const fees = useShielderFees({ walletAddress: address, token });

  return (
    <Wrapper>
      <Amount>{isPresent(decimals) && formatBalance({ balance: selectedTransaction.amount, decimals })}</Amount>
      <Token>
        <TokenIcon
          size={16}
          {...(tokenAddress ? { address: tokenAddress as Address }: { Icon: chainConfig?.NativeTokenIcon })}
        />
        {symbol}
      </Token>
      <Divider />
      <ChainActions provingTimeMillis={selectedTransaction.provingTimeMillis} />
      <Divider />
      <Container>
        <DateWrapper>
          {selectedTransaction.timestamp ? formatTimestamp(selectedTransaction.timestamp) : 'Not available'}
        </DateWrapper>
        <Badge
          leftIcon="CheckmarkRegular"
          size="large"
          variant="success"
          design="tint"
          text="Completed"
          circular
        />
      </Container>
      <Divider />
      <InfoPairs>
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
        <InfoPair
          label="Transaction ID"
          value={
            <RowValue>
              <a href={`${chainConfig?.blockExplorers?.default.url}/tx/${selectedTransaction.txHash}`} target="_blank" rel="noopener norefferer">{shortenTxString(selectedTransaction.txHash)}</a>
              <CIcon icon="Open" size={18} />
            </RowValue>
          }
        />
        {
          !fees ? null :
          isShielded && chainConfig ? (
            <InfoPair
              label="Transaction fee"
              value={
                <RowValue>
                  <TokenIcon Icon={chainConfig.NativeTokenIcon} />
                  {formatBalance({
                    balance: fees.fee_details.total_cost_native,
                    decimals: chainConfig.nativeCurrency.decimals,
                    options: { formatDecimals: 5 },
                  })}
                </RowValue>
              }
            />
          ) :
            isPresent(decimals) && tokenAddress ? (
              <InfoPair
                label="Transaction fee"
                value={
                  <RowValue>
                    <TokenIcon address={tokenAddress as Address} />
                    {formatBalance({
                      balance: fees.fee_details.total_cost_fee_token,
                      decimals,
                      options: { formatDecimals: 5 },
                    })}
                  </RowValue>
                }
              />
            ) :
              null
        }
      </InfoPairs>
    </Wrapper>
  );
};

export default RecordPreview;

const RowValue = styled.div`
    display: flex;
    align-items: center;
    gap: ${vars('--spacing-s')};
    ${typography.web.body1Strong};
`;

const Wrapper = styled.div`
    margin-inline: calc(-1 * ${vars('--spacing-xxl')});
    padding-inline: ${vars('--spacing-xxl')};
    overflow: auto;
`;

const Amount = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: ${vars('--spacing-xs')};

    font-variant-numeric: slashed-zero;
    ${typography.decorative.title1}
`;

const Divider = styled.div`
    left: 0;
    right: 0;
    margin-top: ${vars('--spacing-l')};
    margin-bottom: ${vars('--spacing-l')};
    border-bottom: 1px solid ${vars('--color-neutral-stroke-subtle-rest')};
`;

const Token = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${vars('--spacing-xs')};
    ${typography.decorative.subtitle2};

    & svg {
        width: 20px;
        height: 20px;
        margin-right: ${vars('--spacing-xs')};
    }
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const DateWrapper = styled.div`
    ${typography.web.caption1}
    color: ${vars('--color-neutral-foreground-2-rest')};
`;

const InfoPairs = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${vars('--spacing-m')};
`;
