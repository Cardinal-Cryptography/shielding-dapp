import { skipToken, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { ComponentProps, useMemo, useState } from 'react';
import styled from 'styled-components';
import { usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import fromDecimals from 'src/domains/misc/utils/fromDecimals.ts';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import isPresent from 'src/domains/misc/utils/isPresent';
import useTransactionFees from 'src/domains/misc/utils/useTransactionFees';
import FeeBreakdown from 'src/domains/shielder/components/FeeRows';
import { Token } from 'src/domains/shielder/components/TokenList';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import AssetBox from '../../AssetBox';
import shieldImage from '../shield.png';

type Props = {
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
  feeConfig: ComponentProps<typeof FeeBreakdown>['config'],
  onContinue: (amount: bigint) => void,
};

const SelectAmountPage = ({ token, feeConfig, onContinue }: Props) => {
  const { address } = useWallet();
  const publicClient = usePublicClient();
  const chainConfig = useChain();

  const [value, setValue] = useState('');
  const [isExceedingBalance, setIsExceedingBalance] = useState(false);

  const fees = useTransactionFees({ walletAddress: address, token });

  const maxAmountToSend = useMemo(() => {
    if (!isPresent(token.balance)) return token.balance;
    if (!isPresent(fees)) return token.balance;
    return BigInt(BigNumber.max((token.balance - fees.fee_details.total_cost_fee_token).toString(), 0).toString());
  }, [token.balance, fees]);

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

  const hasInsufficientFees = publicNativeBalance && fees?.fee_details.total_cost_native ?
    publicNativeBalance < fees.fee_details.total_cost_native :
    false;

  const amount = token.decimals ? fromDecimals(value, token.decimals) : 0n;
  const hasNotSelectedAmount = amount <= 0n;

  const isButtonDisabled = hasNotSelectedAmount || isExceedingBalance || hasInsufficientFees;

  const buttonLabel = useMemo(() => {
    if (hasInsufficientFees) return `Insufficient ${chainConfig?.nativeCurrency.symbol} Balance`;
    if (isExceedingBalance) return `Insufficient ${token.symbol} Balance`;
    if (hasNotSelectedAmount) return 'Enter amount';
    return 'Continue';
  }, [
    hasInsufficientFees,
    isExceedingBalance,
    token.symbol,
    hasNotSelectedAmount,
    chainConfig?.nativeCurrency.symbol,
  ]);

  return (
    <Container>
      <AssetBox
        title="Tokens"
        tokenSymbol={token.symbol}
        currentBalance={token.balance}
        decimals={token.decimals}
        maxAmount={maxAmountToSend}
        token={token}
        effectiveAssetValue={value}
        onAssetValueChange={setValue}
        onAssetBalanceExceeded={setIsExceedingBalance}
        accountType="shielded"
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
  height: fit-content;
`;
