import { ComponentProps, useMemo, useState } from 'react';
import styled from 'styled-components';
import { isNullish } from 'utility-types';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import fromDecimals from 'src/domains/misc/utils/fromDecimals';
import shieldImage from 'src/domains/shielder/assets/shield.png';
import FeeBreakdown from 'src/domains/shielder/components/FeeRows';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
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
  feeConfig: ComponentProps<typeof FeeBreakdown>['config'],
  onContinue: (amount: bigint) => void,
  hasInsufficientFees: boolean,
};

const SelectAmountPage = ({ onContinue, token, feeConfig, hasInsufficientFees }: Props) => {
  const { address } = useWallet();
  const chainConfig = useChain();

  const [value, setValue] = useState('');
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  const fees = useShielderFees({ walletAddress: address, token });

  const maxAmountToShield = useMemo(() => {
    if (isNullish(token.balance)) return token.balance;
    if (isNullish(fees)) return token.balance;
    const result = token.isNative ? token.balance - fees.fee_details.total_cost_native : token.balance;
    return result > 0n ? result : 0n;
  }, [token, fees]);

  const amount = token.decimals ? fromDecimals(value, token.decimals) : 0n;
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
      <FeeBreakdown config={feeConfig} />
      <Button
        disabled={isButtonDisabled}
        variant="primary"
        onClick={() => void onContinue(amount)}
      >
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
