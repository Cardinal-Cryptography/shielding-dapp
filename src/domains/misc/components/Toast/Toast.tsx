import { useDocumentVisibility } from '@react-hookz/web';
import dayjs from 'dayjs';
import { ComponentProps, MouseEvent, MouseEventHandler, PointerEvent, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import userPreferableTimeFormat from 'src/domains/misc/utils/userPreferableTimeFormat';
import { boxShadows, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { STATUS_ICONS_DATA } from './consts';
import useToastProgress from './useToastProgress';

type Action = {
  label: string,
  onClick: () => void,
};

type Props = {
  title: string,
  status: keyof typeof STATUS_ICONS_DATA,
  headerAction?: Action,
  subtitle?: string,
  body?: ReactNode,
  bodyActions?: Action[],
  creationTimestamp: number,
  // in practice, button onClick event does get the PointerEvent's native event on touch devices
  onDismiss?: (e?: MouseEvent<HTMLButtonElement> & { nativeEvent?: PointerEvent }) => void,
  paused?: boolean,
  ttlMs?: number,
  dismissButtonProps?: Partial<ComponentProps<typeof DismissButton>>,
};

const Toast = ({
  title,
  status,
  headerAction,
  subtitle,
  body,
  bodyActions,
  creationTimestamp,
  onDismiss,
  paused,
  ttlMs,
  dismissButtonProps,
}: Props) => {
  const isTabActive = useDocumentVisibility();
  const { icon, color } = STATUS_ICONS_DATA[status];

  const progressBarRef = useToastProgress(ttlMs, !!paused || !isTabActive, onDismiss);

  return (
    <Container title="Toast">
      <IconContainer $fillColorToken={color}>
        <CIcon size={16} icon={icon} />
      </IconContainer>
      <RightSection>
        <Header>
          <Title>{title}</Title>
          <Time>{dayjs(creationTimestamp).format(userPreferableTimeFormat.dayjsFormat)}</Time>
          {headerAction && (
            <Action onClick={headerAction.onClick}>{headerAction.label}</Action>
          )}
          {onDismiss && (
            <DismissButton
              title="Dismiss"
              variant="transparent"
              size="extra-small"
              leftIcon="Dismiss"
              onClick={onDismiss as MouseEventHandler<HTMLButtonElement>}
              {...dismissButtonProps}
            />
          )}
        </Header>
        {!!(subtitle || body) && ( // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
          <MainSection>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
            {body && <Body>{body}</Body>}
          </MainSection>
        )}
        {!!bodyActions?.length && (
          <ActionGroup>
            {bodyActions.map((action, i) =>
              <Action key={i} onClick={action.onClick}>{action.label}</Action>
            )}
          </ActionGroup>
        )}
      </RightSection>
      {ttlMs ? <ProgressBarContainer><ProgressBar ref={progressBarRef} /></ProgressBarContainer> : null}
    </Container>
  );
};

export default Toast;

const Container = styled.article`
  display: flex;

  position: relative;

  align-items: flex-start;
  gap: ${vars('--spacing-s')};

  padding: ${vars('--spacing-m')};

  background-color: ${vars('--color-neutral-background-1-rest')};
  border-radius: ${vars('--border-radius-s')};
  overflow: clip;
  
  ${boxShadows.shadow16}
`;

const IconContainer = styled.div<{ $fillColorToken: string | undefined }>`
  display: grid;
  place-items: center;
  line-height: 0;
  
  & * {
    ${({ $fillColorToken }) => $fillColorToken && css`
      fill: ${$fillColorToken};
    `}
  }
`;

const RightSection = styled.section`
  display: flex;
  
  flex-direction: column;
  flex-grow: 1;
  gap: ${vars('--spacing-xxs')};
  
  min-width: 0;

  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  align-items: baseline;
  
  & > * {
    display: inline-flex; /* fixes a bug on FF causing shift of layout with "baseline" alignment and making it jump around with open devtools */
  }
  
  & > *:last-child {
    margin-right: 0;
  }
`;

const Title = styled.span`
  flex-grow: 1;
  margin-right: ${vars('--spacing-s')};
  color: ${vars('--color-neutral-foreground-1-rest')};
  ${typography.web.body1Strong}
`;

const Time = styled.span`
  min-width: fit-content;
  margin-right: ${vars('--spacing-s')};
  color: ${vars('--color-neutral-foreground-1-rest')};
  ${typography.web.caption1}
`;

const Action = styled.button`
  margin-right: ${vars('--spacing-m')};
  color: ${vars('--color-brand-foreground-link-rest')};
  ${typography.web.body1}
  
  &:hover {
    text-decoration: underline;
  }
`;

const DismissButton = styled(Button)`
  align-self: flex-start;
  align-items: flex-start;
  padding: 0;
`;

const MainSection = styled.main`
  display: flex;
  flex-direction: column;
`;

const Subtitle = styled.p`
  color: ${vars('--color-neutral-foreground-2-rest')};

  word-wrap: anywhere;  /* stylelint-disable-line declaration-property-value-no-unknown */
  ${typography.web.caption1}
`;

const Body = styled.div`
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.caption1}
`;

const ActionGroup = styled.section`
  margin-top: ${vars('--spacing-s')};
`;

const ProgressBarContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;

  height: ${vars('--spacing-xxs')};

  background-color: ${vars('--color-neutral-background-6-rest')};
`;

const ProgressBar = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${vars('--color-brand-stroke-compound-rest')};
  border-radius: ${vars('--border-radius-circular')};

  transform-origin: center left;
`;
