import dayjs from 'dayjs';
import styled, { css, RuleSet } from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

export const ICON_MAP = {
  success: 'CheckmarkRegular',
  pending: 'Spinner',
  failed: 'Dismiss',
  stale: null,
} as const;

export type Status = keyof typeof ICON_MAP ;

export type StepData = {
  title: string,
  timestamp?: number,
  duration?: number,
  status: Status,
};

const Steps = ({ steps }: { steps: StepData[] }) => {
  return (
    <StepsWrapper>
      {steps.map((step, i) => {
        const icon = ICON_MAP[step.status];
        return (
          <Step key={i}>
            <StatusCircle $status={step.status} $showLine={i !== steps.length - 1}>
              {icon === 'Spinner' ? <LoadingIcon icon={icon} size={16} /> : icon && (
                <CIcon
                  icon={icon}
                  size={16}
                  color={vars('--color-neutral-foreground-on-brand-rest')}
                />
              )}
            </StatusCircle>
            <Name>{step.title}</Name>
            {!!step.timestamp && <Timestamp>{dayjs(step.timestamp).format('h:mm A')}</Timestamp>}
            {!!step.duration && <Timestamp>{(step.duration / 1000).toFixed(2)}s</Timestamp>}
          </Step>
        );
      })}
    </StepsWrapper>
  );
};

export default Steps;

const perStatus = <T extends string | RuleSet>(statuses: Record<Status, T>) =>
  ({ $status }: { $status: Status }) => statuses[$status];

const STEP_HEIGHT = 24;

const StepsWrapper = styled.div`
  display: flex;

  flex-direction: column;
  gap: ${vars('--spacing-m-nudge')};

  padding-inline: ${vars('--spacing-l')};
  padding-block: ${vars('--spacing-m')};

  border-radius: ${vars('--spacing-l')};
  background: ${vars('--color-neutral-background-3a-rest')};
`;

const Step = styled.div`
  display: grid;
  align-items: center;
  gap: ${vars('--spacing-m-nudge')};
  grid-template-columns: auto 1fr auto;
  height: ${STEP_HEIGHT}px;
`;

const StatusCircle = styled.div<{ $status: Status, $showLine: boolean }>`
  display: grid;

  position: relative;

  place-items: center;


  height: ${STEP_HEIGHT}px;
  width: ${STEP_HEIGHT}px;


  background: ${
    perStatus({
      failed: vars('--color-status-danger-background-3-rest'),
      pending: vars('--color-neutral-background-5a-rest'),
      success: vars('--color-status-success-background-3-rest'),
      stale: vars('--color-neutral-background-5a-rest'),
    })
  };
  border-radius: ${vars('--border-radius-circular')};
  
  ${({ $showLine, $status }) => $showLine && css`
    &::after {
      content: '';

      position: absolute;
      bottom: 0;

      height: 10px;
      width: 2px;

      background: ${
        perStatus({
          failed: vars('--color-status-danger-background-3-rest'),
          pending: vars('--color-neutral-background-5a-rest'),
          success: vars('--color-status-success-background-3-rest'),
          stale: vars('--color-neutral-background-5a-rest'),
        })({ $status })
      };
      transform: translateY(100%);
    }
  `}
`;

const Name = styled.p`
  ${typography.web.body1}
`;

const Timestamp = styled.p`
  color: ${vars('--color-neutral-foreground-3-rest')};
  ${typography.web.caption2}
`;

const LoadingIcon = styled(CIcon)`
  animation: spin 1.4s linear infinite;

  & *:first-of-type {
    fill: ${vars('--color-brand-stroke-2-contrast-rest')};
  }

  & *:last-of-type {
    fill: ${vars('--color-brand-background-1-rest')};
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
