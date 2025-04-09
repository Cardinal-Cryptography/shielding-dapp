import { ReactElement, useMemo, useState } from 'react';
import styled from 'styled-components';
import { isNullish } from 'utility-types';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import usePublicBalance from 'src/domains/chains/utils/usePublicBalance';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import Modal from 'src/domains/misc/components/Modal';
import fromDecimals from 'src/domains/misc/utils/fromDecimals.ts';
import useTransactionFees from 'src/domains/misc/utils/useTransactionFees';
import FeeRows from 'src/domains/shielder/components/FeeRows.tsx';
import useShield from 'src/domains/shielder/utils/useShield';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { Token } from '../';
import AssetBox from '../AssetBox';

import shieldImage from './shield.png';

type Props = {
  children?: ReactElement,
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
};

const ShieldModal = ({ children, token }: Props) => {
  const { shield, isShielding } = useShield();
  const { address } = useWallet();
  const chainConfig = useChain();

  const [value, setValue] = useState('');
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  const fees = useTransactionFees({ walletAddress: address, token });

  const maxAmountToShield = useMemo(() => {
    if (isNullish(token.balance)) return token.balance;
    if (isNullish(fees)) return token.balance;
    const result = token.isNative ? token.balance - fees.fee_details.total_cost_native : token.balance;
    return result > 0n ? result : 0n;
  }, [token, fees]);

  const { data: publicNativeBalance } = usePublicBalance({ accountAddress: address, token: { isNative: true }});

  const hasInsufficientFees = publicNativeBalance && fees?.fee_details.total_cost_native ?
    publicNativeBalance < fees.fee_details.total_cost_native :
    false;

  const amount = token.decimals ? fromDecimals(value, token.decimals) : 0n;
  const hasNotSelectedAmount = amount <= 0n;
  const isButtonDisabled = hasNotSelectedAmount || isExceedingBalance;

  const handleShield = (closeModal: () => Promise<unknown>) => {
    void shield({ token, amount }).then(() => void closeModal());
  };

  const buttonLabel = useMemo(() => {
    if (isShielding) return 'Shielding';
    if (hasInsufficientFees) return `Insufficient ${chainConfig?.nativeCurrency.symbol} Balance`;
    if (isExceedingBalance) return `Insufficient ${token.symbol} Balance`;
    if (hasNotSelectedAmount) return 'Enter amount';
    return 'Shield tokens';
  }, [
    hasInsufficientFees,
    isShielding,
    isExceedingBalance,
    token.symbol,
    hasNotSelectedAmount,
    chainConfig?.nativeCurrency.symbol,
  ]);

  return (
    <StyledModal title="Shield" triggerElement={children}>
      {close => (
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
          <FeeRows config={[
            {
              label: 'Transaction fee',
              amount: fees?.fee_details.total_cost_native,
              tokenSymbol: chainConfig?.nativeCurrency.symbol,
              tokenDecimals: chainConfig?.nativeCurrency.decimals,
              tokenIcon: chainConfig?.NativeTokenIcon,
            },
          ]}
          />
          <Button
            isLoading={isShielding}
            disabled={isButtonDisabled}
            variant="primary"
            onClick={() => void handleShield(close)}
          >
            {buttonLabel}
          </Button>
        </Container>
      )}
    </StyledModal>
  );
};

export default ShieldModal;

const StyledModal = styled(Modal)`
  padding: ${vars('--spacing-l')};
  width: min(434px, 100vw);
`;

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
  height: fit-content;
`;
