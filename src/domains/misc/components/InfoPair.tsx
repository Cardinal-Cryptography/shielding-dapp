import {
  ReactElement,
} from 'react';
import { styled } from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import Tooltip from 'src/domains/misc/components/Tooltip';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const MIN_SEPARATOR_WIDTH = 10;

type Props = {
  label: ReactElement | string,
  className?: string,
  tooltipText?: string,
  value: ReactElement | string,
};

const InfoPair = ({ label, className, tooltipText, ...props }: Props) => (
  <ContainerHorizontal className={className}>
    <Label>
      {label}
      {tooltipText && (
        <Tooltip text={tooltipText}>
          <CIcon icon="Info" color={vars('--color-neutral-foreground-4-rest')} size={16} />
        </Tooltip>
      )}
    </Label>
    <Separator />
    <Value>
      {props.value}
    </Value>
  </ContainerHorizontal>
);

export default InfoPair;

const CONTAINER_GAP = '--spacing-s';

const ContainerHorizontal = styled.section`
  display: flex;
  align-items: center;
  flex: 1;
  min-height: ${vars('--spacing-xxl')};

  column-gap: ${vars(CONTAINER_GAP)};
`;

const Label = styled.div`
  display: flex;

  align-items: center;
  align-self: flex-start;
  gap: ${vars('--spacing-xs')};

  height: 24px;

  flex-shrink: 0;
  ${typography.web.body1};
`;

const Value = styled.div<{ $allowShrinking?: boolean }>`
  display: flex;
  gap: ${vars('--spacing-xxs')};
  overflow: hidden;

  flex-shrink: ${({ $allowShrinking }) => ($allowShrinking ? 1 : 0)};
  ${typography.web.body1Strong};
`;

const Separator = styled.div`
  flex: 1;
  align-self: end;

  height: 1px;
  min-width: ${MIN_SEPARATOR_WIDTH}px;
  margin-bottom: ${vars('--spacing-s-nudge-2')};

  background: ${vars('--color-neutral-stroke-subtle-rest')};
`;
