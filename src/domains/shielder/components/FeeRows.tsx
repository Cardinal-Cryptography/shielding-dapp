import { motion, AnimatePresence } from 'framer-motion';
import { ComponentType, useState } from 'react';
import styled, { css } from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import InfoPair from 'src/domains/misc/components/InfoPair';
import Skeleton from 'src/domains/misc/components/Skeleton';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import vars from 'src/domains/styling/utils/vars';

type FeeConfig = {
  label: string,
  tokenSymbol?: string,
  tokenIcon?: ComponentType,
  tokenDecimals?: number,
  amount?: bigint,
  isError?: boolean,
};

type Props = {
  config: FeeConfig[],
};

const FeeBreakdown = ({ config }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mainFeeRow = config[0];
  const additionalFeeRows = config.slice(1);

  const hasAdditionalRows = additionalFeeRows.length > 0;

  const mainInfoPair = (
    <InfoPair
      label={mainFeeRow.label}
      value={
        isPresent(mainFeeRow.tokenDecimals) && isPresent(mainFeeRow.amount) ? (
          <FeeAmount $isError={!!mainFeeRow.isError}>
            <TokenIcon Icon={mainFeeRow.tokenIcon} />
            {formatBalance({
              balance: mainFeeRow.amount,
              decimals: mainFeeRow.tokenDecimals,
              options: { formatDecimals: 4 },
            })}
            {' '}
            {mainFeeRow.tokenSymbol}
          </FeeAmount>
        ) : (
          <Skeleton style={{ height: 10 }} />
        )
      }
    />
  );

  return (
    <Container>
      {hasAdditionalRows ? (
        <MainRowToggle onClick={() => void setIsExpanded(prev => !prev)}>
          <CIcon icon="Add" size={14} color={vars('--color-neutral-foreground-4-rest')} />
          {mainInfoPair}
          <ChevronIconWrapper
            initial={{ rotateZ: -90 }}
            animate={{ rotateZ: isExpanded ? -270 : -90 }}
          >
            <CIcon icon="ChevronLeft" size={18} color={vars('--color-neutral-foreground-4-rest')} />
          </ChevronIconWrapper>
        </MainRowToggle>
      ) : (
        mainInfoPair
      )}

      {hasAdditionalRows && (
        <AnimatePresence>
          {isExpanded && (
            <AdditionalRowsWrapper
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {additionalFeeRows.map(({ label, amount, isError, tokenDecimals, tokenIcon, tokenSymbol }) => (
                <AdditionalRow key={label}>
                  <VerticalConnector />
                  <AdditionalInfoPair
                    label={label}
                    value={
                      isPresent(tokenDecimals) && isPresent(amount) ? (
                        <FeeAmount $isError={!!isError}>
                          <TokenIcon Icon={tokenIcon} />
                          {formatBalance({
                            balance: amount,
                            decimals: tokenDecimals,
                            options: { formatDecimals: 4 },
                          })}
                          {' '}
                          {tokenSymbol}
                        </FeeAmount>
                      ) : (
                        <Skeleton style={{ height: 10 }} />
                      )
                    }
                  />
                </AdditionalRow>
              ))}
            </AdditionalRowsWrapper>
          )}
        </AnimatePresence>
      )}
    </Container>
  );
};

export default FeeBreakdown;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xs')};
`;

const FeeAmount = styled.div<{ $isError: boolean }>`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  ${({ $isError }) =>
    $isError &&
    css`
      color: ${vars('--color-status-danger-foreground-1-rest')};
    `}
`;

const MainRowToggle = styled.button`
  display: grid;
  grid-template-columns: 16px 1fr 20px;
  align-items: center;
`;

const ChevronIconWrapper = styled(motion.div)`
  display: flex;
  align-self: center;

  justify-self: end;
`;

const AdditionalRowsWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xs')};
  overflow: hidden;
`;

const AdditionalRow = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr 20px;
  align-items: center;
`;

const VerticalConnector = styled.div`
  height: 11px;
  width: 7px;
  margin-left: ${vars('--spacing-xs-nudge')};
  border-bottom: 2px solid ${vars('--color-neutral-stroke-subtle-rest')};

  border-left: 2px solid ${vars('--color-neutral-stroke-subtle-rest')};
`;

const AdditionalInfoPair = styled(InfoPair)`
  color: ${vars('--color-neutral-foreground-3-rest')};
`;
