import { createContext, ReactElement, ReactNode, useContext } from 'react';
import styled, { RuleSet } from 'styled-components';

import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const LeftBarAdditionalShiftContext = createContext(0);

type Size = 'small' | 'medium' | 'large';

type Props = {
  children: string | ReactElement,
  rightSide?: ReactNode,
  className?: string,
  leftBarAdditionalShift?: number,
  showMark?: boolean,
  size: Size,
};

const Title = ({
  children, size, leftBarAdditionalShift: leftBarAdditionalShiftProp, rightSide, className, showMark = true,
}: Props) => {
  const leftBarAdditionalShiftContext = useContext(LeftBarAdditionalShiftContext);
  const leftBarAdditionalShift = leftBarAdditionalShiftProp ?? leftBarAdditionalShiftContext;

  return (
    <TitleBar className={className} $size={size}>
      <Text $size={size} $showMark={showMark} $leftBarAdditionalShift={leftBarAdditionalShift}>{children}</Text>
      {rightSide && (
        <RightSideContainer>
          {rightSide}
        </RightSideContainer>
      )}
    </TitleBar>
  );
};

export default styled(Title)``;

const perSize = <T extends string | RuleSet>(sizes: Record<Size, T>) =>
  ({ $size }: { $size: Size }) => sizes[$size];

const TitleBar = styled.header<{ $size: Size }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: ${perSize({
    small: '24px',
    medium: '32px',
    large: '60px',
  })};
  ${perSize({
    small: typography.decorative.body1Strong,
    medium: typography.decorative.subtitle2,
    large: typography.decorative.subtitle1,
  })}
`;

const Text = styled.span<{ $size: Size, $showMark: boolean, $leftBarAdditionalShift: number }>`
  display: flex;
  position: relative;
  flex-grow: 1;
  align-items: center;

  &::before {
    content: ${({ $showMark }) => $showMark ? '""' : 'none'};
    display: block;

    position: absolute;
    left: calc(
      -1 * ${props => `${props.theme.containerSidePadding ?? '0'}`} -
      ${props => props.$leftBarAdditionalShift}px
    );

    height: ${perSize({
      small: '13px',
      medium: '13px',
      large: '17px',
    })};
    width: ${perSize({
      small: '2px',
      medium: '4px',
      large: '4px',
    })};

    background-color: ${vars('--color-brand-background-static-rest')};
    border-bottom-right-radius: ${vars('--border-radius-xxs')};
    border-top-right-radius: ${vars('--border-radius-xxs')};
  }
`;

export const ProvideLeftBarAdditionalShift = LeftBarAdditionalShiftContext.Provider;

const RightSideContainer = styled.div`
  display: flex;
  gap: ${vars('--border-radius-xs')};
`;
