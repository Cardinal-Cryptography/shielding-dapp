import styled from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  provingTimeMillis: number | undefined,
};

const ChainActions = ({ provingTimeMillis }: Props) => (
  <ChainActionsContainer>
    {provingTimeMillis ? (
      <HighlightedStep>
        <div>
          <HighlightedStepIconWrapper>
            <CIcon size={16} icon="RadioButton" />
          </HighlightedStepIconWrapper>
          <div>
            <StepText>
              Generating ZK Proof
            </StepText>
            <HighlightedStepText>
              <>{Math.round(provingTimeMillis / 10) / 100} sec</>
            </HighlightedStepText>
          </div>
        </div>
        <CIcon icon="CheckmarkCircle" color={vars('--color-status-success-foreground-1-rest')} />
      </HighlightedStep>
    ): (
      <Step>
        <div>
          <IconWrapper>
            <CIcon size={16} icon="RadioButton" />
          </IconWrapper>
          <StepText>
            Generating ZK Proof
          </StepText>
        </div>
        <CIcon icon="CheckmarkCircle" color={vars('--color-status-success-foreground-1-rest')} />
      </Step>
    )}
    <Step>
      <div>
        <IconWrapper>
          <CIcon size={16} icon="RadioButton" />
        </IconWrapper>
        <StepText>
          Sending to relayer
        </StepText>
      </div>
      <CIcon icon="CheckmarkCircle" color={vars('--color-status-success-foreground-1-rest')} />
    </Step>
    <Step>
      <div>
        <ChainIconWrapper>
          <CIcon size={16} icon="RadioButton" />
        </ChainIconWrapper>
        <StepText>
          Execution on chain
        </StepText>
      </div>
      <CIcon icon="CheckmarkCircle" color={vars('--color-status-success-foreground-1-rest')} />
    </Step>
  </ChainActionsContainer>
);

const Step = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-inline: ${vars('--spacing-xxl')};
  
    > div {
      display: flex;
      align-items: center;
      gap: ${vars('--spacing-m')};
    }
`;

const HighlightedStep = styled(Step)`
    padding-block: ${vars('--spacing-l')};
    background: ${vars('--color-neutral-background-3-rest')};
    border-radius: ${vars('--border-radius-s')};
`;

const StepText = styled.div`
    ${typography.web.subtitle2}
    display: flex;
    align-items: center;
    color: ${vars('--color-neutral-foreground-1-rest')};
`;

const HighlightedStepText = styled.div`
    ${typography.decorative.largeTitle}
    font-variant-numeric: slashed-zero;
`;

const ProofIconWrapper = styled.div`
    position: relative;
    color: ${ vars('--color-brand-background-compound-rest')};

    &::after {
        content: "";

        position: absolute;
        left: 7px;
        top: 20px;
        bottom: -84px;

        width: 2px;

        background-color: ${ vars('--color-brand-background-compound-rest')};
        border-radius: ${vars('--border-radius-circular')};
    }
`;

const HighlightedStepIconWrapper = styled(ProofIconWrapper)`
    align-self: start;
    margin-top: ${vars('--spacing-xs')};
`;

const IconWrapper = styled.div`
    position: relative;
    color: ${ vars('--color-brand-background-compound-rest')};

    &::after {
        content: "";

        position: absolute;
        left: 7px;
        top: 20px;
        bottom: -26px;

        width: 2px;

        background-color: ${ vars('--color-brand-background-compound-rest')};
        border-radius: ${vars('--border-radius-circular')};
    }
`;

const ChainIconWrapper = styled.div`
    position: relative;
    color: ${ vars('--color-brand-background-compound-rest')};
`;

const ChainActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${vars('--spacing-xxl')};
    padding-top: ${vars('--spacing-s')};
    padding-bottom: ${vars('--spacing-s')};
`;

export default ChainActions;
