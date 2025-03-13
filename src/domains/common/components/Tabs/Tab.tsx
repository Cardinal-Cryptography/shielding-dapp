import { m as motion } from 'motion/react';
import type { ReactElement } from 'react';
import styled, { RuleSet } from 'styled-components';

import composeFluidSize from 'src/domains/styling/utils/composeFluidSize';
import { transitionTime, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const SELECTED_ITEM_BAR_HEIGHT = 3;

type Size = 'small' | 'medium';
type Position = 'ceiling' | 'floor';

type Props = {
  label: string,
  selected: boolean,
  onClick: () => void,
  disabled?: boolean,
  layoutId: string,
  size?: Size,
  position?: Position,
  icon?: ReactElement,
};

const positionStyles = {
  ceiling: {
    borderBottomLeftRadius: SELECTED_ITEM_BAR_HEIGHT,
    borderBottomRightRadius: SELECTED_ITEM_BAR_HEIGHT,
    top: 0,
  },
  floor: {
    borderTopLeftRadius: SELECTED_ITEM_BAR_HEIGHT,
    borderTopRightRadius: SELECTED_ITEM_BAR_HEIGHT,
    bottom: 0,
  },
};

const Tab = ({ label, selected, onClick, disabled, layoutId, size = 'medium', position = 'floor', icon }: Props) => (
  <Container
    selected={selected}
    onClick={onClick}
    disabled={disabled}
    title={label}
    $size={size}
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { delay: 0.1 }}}
    exit={{ opacity: 0 }}
  >
    <LabelContainer>
      {icon}
      {label}
    </LabelContainer>
    <HoverBar style={positionStyles[position]} />
    {selected && (
      <SelectionBar
        // set as an inline style for scale correction during transition (https://www.framer.com/motion/layout-animations/##scale-correction)
        style={positionStyles[position]}
        layoutId={layoutId}
      />
    )}
  </Container>
);

export default Tab;

const HORIZONTAL_SPACE = vars('--spacing-s');

const perSelected = (variants: Record<'true' | 'false', string | RuleSet>) =>
  ({ selected }: { selected: boolean }) => variants[selected ? 'true' : 'false'];

const perSize = <T extends string | RuleSet | (({ selected }: { selected: boolean }) => RuleSet)>(
  sizes: Record<Size, T>
) => ({ $size }: { $size: Size }) => sizes[$size];

const SelectionBar = styled(motion.div)`
  display: block;

  position: absolute;
  left: ${HORIZONTAL_SPACE};
  right: ${HORIZONTAL_SPACE};

  height: ${SELECTED_ITEM_BAR_HEIGHT}px;

  background-color: ${vars('--color-brand-stroke-compound-rest')};
  transition: background-color ${transitionTime};
`;

const HoverBar = styled(SelectionBar)`
  flex-grow: 0;
  background-color: ${vars('--color-neutral-stroke-1-hover')};
  opacity: 0;
  transition: background-color opacity ${transitionTime};
`;

const LabelContainer = styled.div`
  display: flex;
  gap: ${vars('--spacing-xxs')};
  align-items: center;

  svg {
    fill: ${vars('--color-brand-foreground-compound-rest')};
  }
`;

const Container = styled(motion.button)<{ selected: boolean, $size: Size }>`
  display: flex;

  position: relative;

  flex-direction: column;
  justify-content: center;
  align-items: center;

  max-width: fit-content;
  padding: ${perSize({
    small: vars('--spacing-m-nudge'),
    medium: composeFluidSize(
      { sizeToken: vars('--spacing-m'), atBreakpoint: 360 },
      { sizeToken: vars('--spacing-l'), atBreakpoint: 640 },
      'vw'
    ),
  })} ${HORIZONTAL_SPACE};

  color: ${perSelected({
    false: vars('--color-neutral-foreground-2-rest'),
    true: vars('--color-neutral-foreground-1-rest'),
  })};

  border-radius: ${vars('--border-radius-xxs')};

  outline-offset: 1px;

  /* Note: When changing fonts here, make sure to supply the widest one to the hack below! */
  ${perSize({
    small: ({ selected }: { selected: boolean }) => (
      selected ? typography.decorative.body1Strong : typography.decorative.body1
    ),
    medium: ({ selected }: { selected: boolean }) => (
      selected ? typography.decorative.subtitle2 : typography.decorative.body2
    ),
  })}

  &:focus-visible {
    outline: 3px solid ${vars('--color-neutral-stroke-focus-2-rest')};
  }

  &:hover {
    color: ${perSelected({
      false: vars('--color-neutral-foreground-1-hover'),
      true: vars('--color-neutral-foreground-2-hover'),
    })};

    ${SelectionBar} {
      background-color: ${vars('--color-brand-stroke-compound-hover')};
    }

    ${HoverBar} {
      opacity: 1;
      background-color: ${vars('--color-neutral-stroke-1-hover')};
    }
  }

  &:active {
    color: ${perSelected({
      false: vars('--color-neutral-foreground-1-pressed'),
      true: vars('--color-neutral-foreground-2-pressed'),
    })};

    ${SelectionBar} {
      background-color: ${vars('--color-brand-stroke-compound-pressed')};
    }

    ${HoverBar} {
      opacity: 1;
      background-color: ${vars('--color-neutral-stroke-1-pressed')};
    }
  }

  &:disabled {
    color: ${vars('--color-neutral-foreground-disabled-rest')};

    ${SelectionBar} {
      background-color: ${vars('--color-neutral-foreground-disabled-rest')};
    }

    ${HoverBar} {
      opacity: 0;
    }
  }
`;
