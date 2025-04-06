import { skipToken, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { ReactElement, useMemo, useState } from 'react';
import styled from 'styled-components';
import { usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import Modal from 'src/domains/misc/components/Modal';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import isPresent from 'src/domains/misc/utils/isPresent';
import useTransactionFee from 'src/domains/misc/utils/useTransactionFee';
import NetworkFeeRow from 'src/domains/shielder/components/NetworkFeeRow';
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
  const publicClient = usePublicClient();
  const chainConfig = useChain();

  const [value, setValue] = useState('');
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  const valueBn = useMemo(() => {
    return token.decimals ? BigNumber(value || 0).shiftedBy(token.decimals) : BigNumber(0);
  }, [value, token.decimals]);

  const transactionFee = useTransactionFee({ walletAddress: address });

  const maxAmountToShield = useMemo(() => {
    if (!isPresent(token.balance)) return token.balance;
    if (!isPresent(transactionFee)) return token.balance;
    return BigInt(BigNumber.max((token.balance - transactionFee).toString(), 0).toString());
  }, [token.balance, transactionFee]);

  const { data: publicNativeBalance } = useQuery({
    queryKey:
      address && chainConfig?.id ?
        getQueryKey.tokenPublicBalance(address, chainConfig.id, address) :
        [],
    queryFn:
      publicClient && address ?
        () => publicClient.getBalance({ address }) :
        skipToken,
  });

  const hasInsufficientFees = publicNativeBalance && transactionFee ?
    publicNativeBalance < transactionFee :
    false;

  const hasNotSelectedAmount = valueBn.lte(0);
  const isButtonDisabled = valueBn.lte(0) || isExceedingBalance;

  const handleShield = () => {
    void shield({ token, amount: BigInt(valueBn.toString()) });
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
      <Container>
        <AssetBox
          accountType="public"
          title="Tokens"
          tokenSymbol={token.symbol}
          currentBalance={token.balance}
          decimals={token.decimals}
          maxNativeAmount={maxAmountToShield}
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
        <NetworkFeeRow transactionFee={transactionFee} isError={hasInsufficientFees} />
        <Button isLoading={isShielding} disabled={isButtonDisabled} variant="primary" onClick={handleShield}>
          {buttonLabel}
        </Button>
      </Container>
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
