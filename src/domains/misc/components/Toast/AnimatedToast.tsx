import { motion, useIsPresent } from 'framer-motion';
import { ComponentProps, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import useHasTouchCapability from 'src/domains/misc/utils/useHasTouchCapability.ts';

import Toast from '../Toast';

const MAX_VISIBLE_CARDS_IN_STACKED_DECK = 3;
const DISMISS_DRAG_VELOCITY_THRESHOLD = 700;

type Props = ComponentProps<typeof Toast> & {
  indexFromTopOfDeck: number,
  isDeckSpreadOut: boolean,
  isDeckHovered: boolean,
  dismissToast: () => void,
};

const AnimatedToast = forwardRef<HTMLDivElement, Props>(({
  indexFromTopOfDeck,
  isDeckSpreadOut,
  isDeckHovered,
  dismissToast,
  ...toastProps
}, ref) => {
  const isBeingRemovedFromList = !useIsPresent();
  const hasTouchCapability = useHasTouchCapability();
  const isDragEnabled =
    hasTouchCapability &&
    /*
      If deck is spread out, enable dismissing by dragging on all elements. If it's stacked,
      only enable to dismiss by dragging on the one on the top of the deck, to avoid accidental
      dismissal of the toasts in the background.
     */
    (isDeckSpreadOut || indexFromTopOfDeck === 0);

  const animationConfig = isDeckSpreadOut ? {
    opacity: 1,
    scale: 1,
    y: 0,
  } : {
    opacity: indexFromTopOfDeck < MAX_VISIBLE_CARDS_IN_STACKED_DECK ? 1 : 0,
    scale: Math.max(0, 1 - 0.1 * indexFromTopOfDeck),
    y: -10 * Math.min(MAX_VISIBLE_CARDS_IN_STACKED_DECK - 1, indexFromTopOfDeck),
  };

  return (
    <RemovableToast
      ref={ref}
      $isActivelyPresentInCollapsedDeck={!isDeckSpreadOut && !isBeingRemovedFromList}
      layout
      exit={{ opacity: 0, scale: 0 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        ...animationConfig,
        transition: {
          delay: isDeckHovered ? 0.02 * indexFromTopOfDeck : 0,
        },
      }}
      transition={{ layout: { type: 'spring', mass: .6 }}}
      style={{ originY: 0 }}
      drag={isDragEnabled ? 'x' : false}
      dragSnapToOrigin
      dragTransition={{ bounceStiffness: 900, bounceDamping: 30 }}
      dragConstraints={{ left: -100, right: 100 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.velocity.x) >= DISMISS_DRAG_VELOCITY_THRESHOLD) dismissToast();
      }}
    >
      <Toast
        {...toastProps}
        paused={isDeckHovered || indexFromTopOfDeck !== 0}
        onDismiss={dismissToast}
        dismissButtonProps={{
          onTouchEnd: e => {
            // prevent hover-like events on touch to not spread out the deck when hitting the dismiss button
            e.preventDefault();
            dismissToast();
          },
        }}
      />
    </RemovableToast>
  );
});

export default AnimatedToast;

const activelyPresentInCollapsedDeckCss = css`
  /*
    Prevents all toasts apart of the top-most one from stretching the container,
    so that the toasts deck is aligned to the top-most one.

    The toasts that were dismissed but are still pending the "leave" animation are also ignored - hence
    "$isActivelyPresentInCollapsedDeck" used with the "of" operator in "nth-last-child".
  */
  @supports selector(:nth-child(1 of &)) {
    &:not(:nth-last-child(1 of &)) {
      position: absolute;
      width: 100%;
    }
  }

  @supports not selector(:nth-child(1 of &)) {
    /*
      The drawback of the fallback is that it gets a little "jumpy" when the top-most toast
      is dismissed in the stacked deck layout.
    */
    &:not(:nth-last-child(1)) {
      position: absolute;
      width: 100%;
    }
  }
`;

const RemovableToast = styled(motion.div)<{ $isActivelyPresentInCollapsedDeck: boolean }>`
  ${props => props.$isActivelyPresentInCollapsedDeck && activelyPresentInCollapsedDeckCss}
`;
