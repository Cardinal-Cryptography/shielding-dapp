import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { isNullish } from 'utility-types';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import fromDecimals from 'src/domains/misc/utils/fromDecimals';
import shieldImage from 'src/domains/shielder/assets/shield.png';
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
  onContinue: (amount: bigint) => void,
  hasInsufficientFees: boolean,
};

const SelectAmountPage = ({ onContinue, token, hasInsufficientFees }: Props) => {
  const { address } = useWallet();

  const [value, setValue] = useState('');
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  const { totalFee } = useShielderFees({ token, operation: 'send' });

  const maxAmountToSend = useMemo(() => {
    if (isNullish(token.balance)) return token.balance;
    if (isNullish(totalFee)) return token.balance;
    const result = token.balance - totalFee;
    return result > 0n ? result : 0n;
  }, [token, totalFee]);

  const amount = token.decimals ? fromDecimals(value, token.decimals) : 0n;
  const hasNotSelectedAmount = amount <= 0n;
  const isButtonDisabled = hasNotSelectedAmount || isExceedingBalance || hasInsufficientFees;

  const buttonLabel =
    hasInsufficientFees ?
      `Insufficient ${token.symbol} Balance` :
      isExceedingBalance ?
        `Insufficient ${token.symbol} Balance` :
        hasNotSelectedAmount ?
          'Enter amount' :
          'Continue';

  return (
    <Container>
      <AssetBox
        accountType="shielded"
        title="Tokens"
        tokenSymbol={token.symbol}
        currentBalance={token.balance}
        decimals={token.decimals}
        maxAmount={maxAmountToSend}
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
            You’re about to send tokens from your shielded account to a public account.
            It will originate from the shielded pool, leaving your old transfer history behind.
          </p>
        </InfoContainer>
        <ShieldImage src={shieldImage} alt="Shield icon" />
      </Disclaimer>
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

const Content = styled(DoubleBorderBox.Content)`
  display: flex;

  flex-direction: column;
  gap: ${vars('--spacing-m')};

  margin: ${vars('--spacing-none')};
  padding: ${vars('--spacing-m')};

  background: ${vars('--color-neutral-background-4a-rest')};
`;

const Disclaimer = styled(Content)`
  flex-direction: row;
  justify-content: space-between;
  padding: ${vars('--spacing-xs')} 0 0 0;
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
  height: 110px;
  margin-bottom: -2px;
  margin-right: -32px;
  pointer-events: none;
`;
