import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import convertAssetToUsd from 'src/domains/misc/utils/convertAssetToUsd';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import safeAdd from 'src/domains/numbers/utils/safeAdd';
import vars from 'src/domains/styling/utils/vars';

import BalanceSelector from './BalanceSelector';
import type { BalanceType } from './consts';

type BalanceProps = {
  selectedAccountType: BalanceType,
  setSelectedAccountType: (key: BalanceType) => void,
  publicBalance: bigint | undefined,
  privateBalance: bigint | undefined,
  nativeAssetDecimals: number | undefined,
  nativeAssetUsdPrice: number | undefined,
  publicTokensUsdValue: number | undefined,
};

const Balance = ({
  selectedAccountType,
  setSelectedAccountType,
  publicBalance,
  privateBalance,
  nativeAssetDecimals,
  nativeAssetUsdPrice,
  publicTokensUsdValue,
}: BalanceProps) => {
  const {
    assetUsdValue: publicNativeBalanceUsdValue,
  } = convertAssetToUsd(nativeAssetUsdPrice, publicBalance, nativeAssetDecimals);

  const {
    assetUsdValue: privateNativeBalanceUsdValue,
    assetUsdValueFormatted: privateNativeBalanceUsdValueFormatted,
  } = convertAssetToUsd(nativeAssetUsdPrice, privateBalance, nativeAssetDecimals);

  const publicUsdValue = safeAdd(publicNativeBalanceUsdValue, publicTokensUsdValue);

  const value = {
    public: publicUsdValue ?? 0,
    shielded: privateNativeBalanceUsdValue ?? 0,
  }[selectedAccountType];

  const fontSize = value >= 1_000_000_000 ? 'small' :
    value >= 1_000_000 ? 'medium' :
    'large';

  return (
    <Container>
      <BalanceSelector
        selectedBalance={selectedAccountType}
        setSelectedBalance={setSelectedAccountType}
        publicBalanceUsdValue={
          isPresent(publicUsdValue) ?
            formatBalance({ balance: publicUsdValue * 100, decimals: 2 }) :
            undefined
        }
        privateBalanceUsdValue={privateNativeBalanceUsdValueFormatted}
      />
      <BalanceWrapper>
        <Value
          value={value}
          format={{
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            currency: 'USD',
            style: 'currency',
          }}
          locales="en-US"
          $fontSize={fontSize}
        />
      </BalanceWrapper>
    </Container>
  );
};

export default Balance;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Value = styled(NumberFlow)<{ $fontSize: 'large' | 'medium' | 'small' }>`
  margin-inline: ${vars('--spacing-xxs')};

  font-size: ${({ $fontSize }) => ({
      large: 48,
      medium: 40,
      small: 32,
    })[$fontSize]
  }px;
  font-family: Borna, sans-serif;
  line-height: 48px; /* 100% */
  font-weight: 500;
  font-style: normal;

  font-feature-settings: 'ss01' on;
  
  &::part(currency) {
    font-size: ${({ $fontSize }) => ({
        large: 22,
        medium: 19,
        small: 15,
      })[$fontSize]
    }px;
    line-height: 28px;
    font-weight: 600;
    transform: translateY(calc(-50% - 3px));
  }
`;

const BalanceWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-top: 28px;
  margin-bottom: 32px;
  height: 48px;
`;
