import styled from 'styled-components';
import { type Address } from 'viem';

import useChain from 'src/domains/chains/utils/useChain';
import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import InfoPair from 'src/domains/misc/components/InfoPair';
import Skeleton from 'src/domains/misc/components/Skeleton';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import { Token } from 'src/domains/shielder/components/TokenList';
import useFeeBreakdownModal from 'src/domains/shielder/utils/useFeeBreakdownModal';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
  addressTo?: Address,
  addressFrom?: Address,
  amount: bigint,
  onConfirm: () => void,
  isLoading?: boolean,
  hasInsufficientFees?: boolean,
  buttonLabel: string,
};

const ConfirmPage = ({
  token,
  amount,
  addressTo,
  onConfirm,
  isLoading,
  addressFrom,
  hasInsufficientFees,
  buttonLabel,
}: Props) => {

  const chainConfig = useChain();

  const operation = addressTo ? 'send' : 'shield';
  const { fees, totalFee, isLoading: areShielderFeesLoading } = useShielderFees({ token, operation, amount });

  const {
    symbolQuery: { data: nativeTokenSymbol },
    decimalsQuery: { data: nativeTokenDecimals },
  } = useTokenData({ isNative: true }, ['symbol', 'decimals']);

  const openFeeBreakdownModal = useFeeBreakdownModal({ fees, totalFee });

  const isButtonDisabled = amount <= 0n || !!hasInsufficientFees || !!isLoading;

  return (
    <Container>
      <Wrapper>
        {token.decimals && (
          <Content>
            <TokenDetails>
              <TokenIcon Icon={token.icon} size={40} />
              <p>{token.symbol}</p>
            </TokenDetails>
            <Amount>
              {formatBalance({ balance: amount, decimals: token.decimals, options: { formatDecimals: 4 }})}
            </Amount>
          </Content>
        )}
        <Content>
          <p>From</p>
          <AccountDetails>
            <AccountTypeIcon size={20} type={addressFrom ? 'public' : 'shielded'} />
            {addressFrom && (
              <>
                <p>Public</p>
                <Divider />
              </>
            )}
            {addressFrom ? <Address>{formatAddress(addressFrom)}</Address> : 'Shielded'}
          </AccountDetails>
        </Content>
        {addressTo && (
          <Content>
            <p>To</p>
            <Address>{formatAddress(addressTo)}</Address>
          </Content>
        )}
      </Wrapper>
      <Details>
        <InfoPair
          label={
            <TotalFee>
              <p>Est. Total fee</p>
              <button onClick={() => void openFeeBreakdownModal()}>
                <CIcon size={16} icon="InfoRegular" />
              </button>
            </TotalFee>
          }
          value={
            !areShielderFeesLoading && isPresent(nativeTokenDecimals) && isPresent(totalFee) ? (
              <FeeAmount $isError={!!hasInsufficientFees}>
                <TokenIcon Icon={chainConfig?.NativeTokenIcon} />
                {formatBalance({
                  balance: totalFee,
                  decimals: nativeTokenDecimals,
                  options: { formatDecimals: 5 },
                })}
                {' '}
                {nativeTokenSymbol}
              </FeeAmount>
            ) : (
              <Skeleton style={{ height: 10, width: 110 }} />
            )
          }
        />
      </Details>
      <Footer>
        <Button isLoading={!!isLoading} disabled={isButtonDisabled} variant="primary" onClick={onConfirm}>
          {buttonLabel}
        </Button>
      </Footer>
    </Container>
  );
};

export default ConfirmPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${vars('--spacing-xxl')};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-s')};
`;

const Footer = styled(Wrapper)`
  gap: ${vars('--spacing-xl')};
`;

const Content = styled(DoubleBorderBox.Content)`
  display: flex;
  
  gap: ${vars('--spacing-m')};
  align-items: center;
  justify-content: space-between;

  margin: ${vars('--spacing-none')};
  padding: ${vars('--spacing-l')};

  background: ${vars('--color-neutral-background-4a-rest')};
  
  ${typography.web.body1};
`;

const AccountDetails = styled.div`
  display: flex;
  gap: ${vars('--spacing-s')};
  align-items: center;
`;

const Address = styled.p`
  color: ${vars('--color-brand-foreground-1-rest')};
`;

const Amount = styled.div`
  ${typography.decorative.title1};
`;

const TokenDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  ${typography.decorative.subtitle2};
`;

const Divider = styled.div`
  height: 12px;
  width: 1px;
  background: ${vars('--color-neutral-stroke-2-rest')};
`;

const FeeAmount = styled.div<{ $isError: boolean }>`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  color: ${({ $isError }) => ($isError ? vars('--color-status-danger-foreground-1-rest') : vars('--color-neutral-foreground-2-rest'))};
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-m')};
`;

const TotalFee = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.body1};
  
  & > button {
    display: flex;
  }
`;
