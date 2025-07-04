import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { isNullish } from 'utility-types';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import InfoPair from 'src/domains/misc/components/InfoPair';
import Skeleton from 'src/domains/misc/components/Skeleton';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import fromDecimals from 'src/domains/misc/utils/fromDecimals';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import shieldImage from 'src/domains/shielder/assets/shield.png';
import useFeeBreakdownModal from 'src/domains/shielder/utils/useFeeBreakdownModal';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { Token } from '../../';
import AssetBox from '../../AssetBox';

type Props = {
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
  onContinue: (amount: bigint) => void,
  hasInsufficientFees: boolean,
};

const SelectAmountPage = ({ onContinue, token, hasInsufficientFees }: Props) => {
  const { address } = useWallet();
  const chainConfig = useChain();

  const [value, setValue] = useState('');
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  const amount = token.decimals ? fromDecimals(value, token.decimals) : 0n;

  const { fees, totalFee, isLoading: areShielderFeesLoading } = useShielderFees({
    token,
    operation: 'shield',
    amount,
  });

  const {
    symbolQuery: { data: nativeTokenSymbol },
    decimalsQuery: { data: nativeTokenDecimals },
  } = useTokenData({ isNative: true }, ['symbol', 'decimals']);

  const openFeeBreakdownModal = useFeeBreakdownModal({ fees, totalFee });

  const maxAmountToShield = useMemo(() => {
    if (isNullish(token.balance)) return token.balance;
    if (isNullish(totalFee)) return token.balance;
    const result = token.isNative ? token.balance - totalFee : token.balance;
    return result > 0n ? result : 0n;
  }, [token, totalFee]);

  const hasNotSelectedAmount = amount <= 0n;
  const isButtonDisabled = hasNotSelectedAmount || isExceedingBalance || hasInsufficientFees;

  const buttonLabel =
    hasInsufficientFees ?
      `Insufficient ${chainConfig?.nativeCurrency.symbol} Balance` :
      isExceedingBalance ?
        `Insufficient ${token.symbol} Balance` :
        hasNotSelectedAmount ?
          'Enter amount' :
          'Shield tokens';

  return (
    <Container>
      <AssetBox
        accountType="public"
        title="Tokens"
        tokenSymbol={token.symbol}
        currentBalance={token.balance}
        decimals={token.decimals}
        maxAmount={maxAmountToShield}
        token={token}
        effectiveAssetValue={value}
        onAssetValueChange={setValue}
        accountAddress={address}
        onAssetBalanceExceeded={setIsExceedingBalance}
      />
      <Disclaimer>
        <InfoContainer>
          <CIcon icon="InfoRegular" size={20} color={vars('--color-neutral-foreground-3-rest')} />
          <p>
            You're about to shield your tokens.
            Your shielded account balance and actions will be private and secured.
          </p>
        </InfoContainer>
        <ShieldImage src={shieldImage} alt="Shield icon" />
      </Disclaimer>
      <FeeWrapper>
        <InfoPair
          label={
            <TotalFeeLabel>
              <p>Est. Total fee</p>
              <button onClick={() => void openFeeBreakdownModal()}>
                <CIcon size={16} icon="InfoRegular" />
              </button>
            </TotalFeeLabel>
          }
          value={
            !areShielderFeesLoading && isPresent(nativeTokenDecimals) && isPresent(totalFee) ? (
              <FeeAmount $isError={hasInsufficientFees}>
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
      </FeeWrapper>
      <Button disabled={isButtonDisabled} variant="primary" onClick={() => void onContinue(amount)}>
        {buttonLabel}
      </Button>
    </Container>
  );
};

export default SelectAmountPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xl')};
`;

const Disclaimer = styled(DoubleBorderBox.Content)`
  display: flex;
  justify-content: space-between;
  margin: ${vars('--spacing-none')};
  padding: ${vars('--spacing-s')} 0 0 0;
  background: ${vars('--color-neutral-background-4a-rest')};
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xs')};
  padding: ${vars('--spacing-m')} ${vars('--spacing-l')} ${vars('--spacing-l')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.caption1};
`;

const ShieldImage = styled.img`
  align-self: end;
  height: 120px;
  margin-bottom: -10px;
  margin-right: -30px;
  pointer-events: none;
`;

const FeeAmount = styled.div<{ $isError: boolean }>`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  color: ${({ $isError }) => ($isError ? vars('--color-status-danger-foreground-1-rest') : vars('--color-neutral-foreground-2-rest'))};
`;

const FeeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-m')};
`;

const TotalFeeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.body1};

  & > button {
    display: flex;
  }
`;
