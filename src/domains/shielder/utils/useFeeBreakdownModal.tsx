import styled from 'styled-components';

import useChain from 'src/domains/chains/utils/useChain';
import InfoPair from 'src/domains/misc/components/InfoPair';
import Modal, { useModal } from 'src/domains/misc/components/Modal';
import Skeleton from 'src/domains/misc/components/Skeleton';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import { FeeStructure } from 'src/domains/shielder/utils/useShielderFees';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  fees?: FeeStructure,
  totalFee?: bigint,
};

const useFeeBreakdownModal = ({ fees, totalFee }: Props) => {
  const { open } = useModal();
  const chainConfig = useChain();

  const {
    symbolQuery: { data: nativeTokenSymbol },
    decimalsQuery: { data: nativeTokenDecimals },
  } = useTokenData({ isNative: true }, ['symbol', 'decimals']);

  const getFeeLabel = (type: string) => {
    switch (type) {
      case 'network':
        return 'Network';
      case 'allowance':
        return 'Allowance';
      case 'relayer':
        return 'Relayer';
      default:
        return type;
    }
  };

  return () => {
    const modal = (
      <Modal config={{
        title: 'Est. Total fee breakdown',
        content: (
          <Container>
            <Divider />
            <Details>
              <InfoPair
                label="Est. Total fee"
                value={
                  isPresent(nativeTokenDecimals) && isPresent(totalFee) ? (
                    <FeeAmount>
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
                    <Skeleton style={{ height: 10 }} />
                  )
                }
              />
              {!!fees?.length && (
                <FeeBreakdown>
                  {fees.map((fee, index) => (
                    <InfoPairWrapper>
                      <VerticalConnector />
                      <InfoPair
                        key={`${fee.type}-${index}`}
                        label={getFeeLabel(fee.type)}
                        tooltipText="TBD"
                        value={
                          isPresent(nativeTokenDecimals) && isPresent(fee.amount) ? (
                            <FeeAmount>
                              <TokenIcon Icon={chainConfig?.NativeTokenIcon} />
                              {formatBalance({
                                balance: fee.amount,
                                decimals: nativeTokenDecimals,
                                options: { formatDecimals: 5 },
                              })}
                              {' '}
                              {nativeTokenSymbol}
                            </FeeAmount>
                          ) : (
                            <Skeleton style={{ height: 10 }} />
                          )
                        }
                      />
                    </InfoPairWrapper>
                  ))}
                </FeeBreakdown>
              )}
            </Details>
            <Divider />
            <Disclaimer>
              This is the maximum estimate—it can be slightly lower upon execution.
              <br />
              <br />
              Want to know more about fees?
              {' '}
              <LearnMoreLink>Learn more</LearnMoreLink>
            </Disclaimer>
          </Container>
        ),
      }}
      />
    );

    open(modal);
  };
};

export default useFeeBreakdownModal;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-l')};
  ${typography.web.body1};
`;

const FeeBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-l-nudge')};
  padding-left: ${vars('--spacing-xs-nudge')};
  padding-right: ${vars('--spacing-s')};
`;

const FeeAmount = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-neutral-foreground-1-rest')};
`;

const Disclaimer = styled.p`
  color: ${vars('--color-neutral-foreground-2-rest')};
`;

const LearnMoreLink = styled.span`
  color: ${vars('--color-brand-foreground-1-rest')};
  cursor: pointer;

  text-decoration: underline;
`;

const VerticalConnector = styled.div`
  height: 11px;
  width: 10px;
  border-bottom: 1px solid ${vars('--color-neutral-stroke-subtle-rest')};

  border-left: 1px solid ${vars('--color-neutral-stroke-subtle-rest')};
`;

const InfoPairWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  width: 100%;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${vars('--color-neutral-stroke-2-rest')};
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-l')};
  margin-block: ${vars('--spacing-xs')};
`;
