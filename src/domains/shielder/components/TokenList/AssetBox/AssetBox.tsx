import { useDebouncedCallback } from '@react-hookz/web';
import BigNumber from 'bignumber.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { isNullish } from 'utility-types';

import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import Button from 'src/domains/misc/components/Button';
import InteractiveSlider from 'src/domains/misc/components/InteractiveSlider';
import * as SplitBox from 'src/domains/misc/components/SplitBox';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import isPresent from 'src/domains/misc/utils/isPresent';
import { AccountType } from 'src/domains/shielder/types/types';
import { transitionTime, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { Token } from '../TokenList';

import AutoResizingInput from './AutoResizingInput';
import PercentageInput from './PercentageInput';
import formatBalance from './utils/formatBalance';
import fromDecimal from './utils/fromDecimal';
import getDynamicFontSize from './utils/getDynamicFontSize';
import getHumanFriendlyBigNumber from './utils/getHumanFriendlyBigNumber';
import useDecimalInputValue from './utils/useDecimalInputValue';
import useExtendedInputPlaceholder from './utils/useExtendedInputPlaceholder';

type Props = {
  title: string,
  tokenSymbol: string | undefined,
  currentBalance: bigint | undefined,
  decimals: number | undefined,
  maxAmount: bigint | undefined,
  token: Token | undefined,
  effectiveAssetValue: string | undefined,
  onAssetValueChange: (value: string) => void,
  onAssetBalanceExceeded?: (exceeded: boolean) => void,
  isLoading?: boolean,
  accountAddress?: string,
  accountType: AccountType,
};

const AssetBox = ({
  title,
  tokenSymbol,
  currentBalance,
  decimals,
  maxAmount,
  token,
  effectiveAssetValue,
  onAssetValueChange,
  onAssetBalanceExceeded,
  isLoading,
  accountAddress,
  accountType = 'public',
}: Props) => {
  const [manuallyEnteredPercentage, setManuallyEnteredPercentage] = useState<number>();
  const [isPrecise, setIsPrecise] = useState(false);
  const [inputTokenValue, setInputTokenValue] = useDecimalInputValue({
    value: effectiveAssetValue,
    onValueChange: onAssetValueChange,
    maxDecimals: isPrecise ? decimals : 4,
  });

  const formattedBalance = decimals !== undefined && currentBalance ?
    formatBalance(currentBalance, decimals) :
    undefined;

  const transactionMaxValue = currentBalance && !isNullish(decimals) ?
    getHumanFriendlyBigNumber(currentBalance, decimals) :
    undefined;

  const clippedMaxValue = isPresent(maxAmount) && isPresent(decimals) ?
    getHumanFriendlyBigNumber(maxAmount, decimals) : undefined;
  const shouldClipNativeCoinValue = isPresent(maxAmount) && isPresent(clippedMaxValue);

  const handleSliderValueChange = useDebouncedCallback(
    (value: number) => {
      if (!transactionMaxValue || isNullish(decimals)) return;

      const newAssetValue = (
        BigNumber.min(
          shouldClipNativeCoinValue ? clippedMaxValue : transactionMaxValue,
          transactionMaxValue.multipliedBy(value)
        ).dp(decimals, BigNumber.ROUND_FLOOR)
      ).toFixed();

      setIsPrecise(value === 1);
      setManuallyEnteredPercentage(undefined);
      onAssetValueChange(newAssetValue);
    },
    [transactionMaxValue],
    100,
    100
  );

  const isBalanceExceeded = (
    isPresent(decimals) && isPresent(currentBalance) && isPresent(effectiveAssetValue) &&
    fromDecimal(BigNumber(effectiveAssetValue), decimals).toBn()
      .gt(shouldClipNativeCoinValue ? maxAmount.toString() : currentBalance.toString())
  );

  const isBalanceCapped = clippedMaxValue && effectiveAssetValue ?
    BigNumber(effectiveAssetValue).eq(clippedMaxValue) :
    false;

  useEffect(() => {
    onAssetBalanceExceeded?.(isBalanceExceeded);
  }, [isBalanceExceeded, onAssetBalanceExceeded]);

  const percentage = (
    transactionMaxValue?.gt(0) ?
      Number(BigNumber(inputTokenValue).dividedBy(transactionMaxValue).multipliedBy(100).toFixed(
        isBalanceCapped ? 2 : 0,
        isBalanceCapped ? 3 : 2
      )) : 0
  );

  const {
    inputValue: inputTokenValueWithExtendedPlaceholder,
    inputProps,
  } = useExtendedInputPlaceholder(inputTokenValue, ['0']);

  return (
    <SplitBox.Container>
      <SplitBox.Section>
        <Row>
          <Title>{title}</Title>
          {BigNumber(inputTokenValue).gt(0) && (
            <ClearButton
              variant="outline"
              size="tiny"
              onClick={() => void setInputTokenValue('0')}
            >
              Clear
            </ClearButton>
          )}
        </Row>
        <Row>
          <TokenDetails>
            <TokenIcon size={40} Icon={token?.icon} />
            <div>
              {tokenSymbol}
            </div>
          </TokenDetails>
          <Input
            style={{ fontSize: getDynamicFontSize(inputTokenValueWithExtendedPlaceholder.length, 24, 32, 0.5) }}
            inputMode="decimal"
            placeholder="0.0"
            value={inputTokenValueWithExtendedPlaceholder}
            onChange={e => {
              setIsPrecise(true);
              setInputTokenValue(e.target.value);
              setManuallyEnteredPercentage(undefined);
            }}
            disabled={isLoading}
            {...inputProps}
          />
        </Row>
        <AccountDetails>
          <p>From</p>
          <Address>
            <AccountTypeIcon size={20} type={accountType} />
            <p>{accountType === 'public' ? 'Public' : 'Shielded'}</p>
            {accountAddress && (
              <>
                <Divider />
                <p>{formatAddress(accountAddress)}</p>
              </>
            )}
          </Address>
        </AccountDetails>
      </SplitBox.Section>
      {currentBalance && (
        <SplitBox.Section>
          <Row>
            {formattedBalance && (
              <>
                <CurrentBalance $highlighted={isBalanceExceeded}>
                  <BalanceLabel>Balance:</BalanceLabel> <Balance>{formattedBalance}</Balance>
                </CurrentBalance>
              </>
            )}
            {isPresent(effectiveAssetValue) && transactionMaxValue?.gt(0) && isPresent(decimals) && (
              <PercentageContainer>
                <AnimatePresence initial={false}>
                  {token?.isNative && ((isBalanceExceeded && percentage <= 100) || isBalanceCapped) && (
                    <motion.div
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 10, opacity: 0 }}
                    >
                      {/*<Tooltip*/}
                      {/*  text="The maximum value of the native coin that can be sold is the balance minus the fees and the existential deposit."*/}
                      {/*>*/}
                      {/*  <InfoIcon />*/}
                      {/*</Tooltip>*/}
                    </motion.div>
                  )}
                </AnimatePresence>
                <PercentageInput
                  value={manuallyEnteredPercentage ?? percentage}
                  onChange={percentage => {
                    setManuallyEnteredPercentage(percentage);
                    setIsPrecise(percentage === 100);
                    onAssetValueChange(
                      transactionMaxValue
                        .multipliedBy(percentage)
                        .div(100)
                        .dp(decimals, BigNumber.ROUND_FLOOR).toFixed()
                    );
                  }}
                  highlighted={isBalanceExceeded}
                />
              </PercentageContainer>
            )}
          </Row>
          {
            isPresent(effectiveAssetValue) &&
            transactionMaxValue?.gt(0) &&
            (
              !shouldClipNativeCoinValue || clippedMaxValue.gt(0)
            ) && (
              <InteractiveSlider
                snapPoints={[0, 0.25, 0.5, 0.75, 1]}
                snapRange={20}
                onValueChange={handleSliderValueChange}
                value={BigNumber(effectiveAssetValue).div(transactionMaxValue).toNumber()}
                highlighted={isBalanceExceeded}
              />
            )
          }
        </SplitBox.Section>
      )}
    </SplitBox.Container>
  );
};

export default AssetBox;

const Title = styled.h3`
  padding-bottom: ${vars('--spacing-m-nudge')};
  
  ${typography.web.caption1}
`;

const ClearButton = styled(Button)`
  align-self: flex-end;
`;

const Row = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${vars('--spacing-s')};
`;

const Input = styled(AutoResizingInput)`
  flex: 1;

  min-width: 0;
  padding: 0;
  border: none;

  ${typography.decorative.title1};
  
  color: ${vars('--color-neutral-foreground-1-rest')};
  text-align: right;

  outline: none;
  background-color: transparent;

  text-overflow: ellipsis;

  &::placeholder {
    color: ${vars('--color-neutral-foreground-4-rest')};
  }

  &:focus {
    color: ${vars('--color-neutral-foreground-1-rest')};
  }
`;

const CurrentBalance = styled.span<{ $highlighted: boolean }>`
  color: ${props => props.$highlighted ?
      vars('--color-status-danger-foreground-1-rest') :
      vars('--color-neutral-foreground-3-rest')
  };
  transition: color ${transitionTime};
`;

const BalanceLabel = styled.span`
  ${typography.web.body1}
`;

const Balance = styled.span`
  ${typography.web.body1Strong}
`;

const PercentageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
`;

const TokenDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  ${typography.decorative.subtitle2}
`;

const AccountDetails = styled.div`
  display: flex;
  gap: ${vars('--spacing-m')};
  ${typography.web.caption1};
  margin-top: ${vars('--spacing-m')};
`;

const Address = styled.div`
  display: flex;
  gap: ${vars('--spacing-s')};
  align-items: center;
  color: ${vars('--color-brand-foreground-1-rest')};
  ${typography.web.body1};
`;

const Divider = styled.div`
  height: ${vars('--spacing-m')};
  width: 1px;
  background: ${vars('--color-neutral-stroke-1-rest')};
`;
