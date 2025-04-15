import { useClickOutside, useMediaQuery } from '@react-hookz/web';
import { AnimatePresence, m as motion } from 'framer-motion';
import { ComponentProps, forwardRef, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import styled from 'styled-components';

import { BOTTOM_MENU_BREAKPOINT, BOTTOM_NAVIGATION_HEIGHT } from 'src/domains/misc/consts/consts';
import composeFluidSize from 'src/domains/styling/utils/composeFluidSize';
import vars from 'src/domains/styling/utils/vars.ts';

import AnimatedToast from './AnimatedToast';
import Toast from './Toast';
import { ToastId } from './types';

const DEFAULT_TOAST_WIDTH = 293;
const NON_SPREADABLE_DECK_BREAKPOINT = '(max-width: 480px)';

type Props = {
  toasts: (ComponentProps<typeof Toast> & { id: ToastId, dismissToast: () => void })[],
};

const AnimatedToastsList = forwardRef<HTMLDivElement, Props>(({ toasts }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  /*
    On narrow screens, if the deck spreads out, it might be hard (or even impossible) for a user
    to touch outside or to unhover the deck so that it stacks back, so we are changing the logic
    of interactions with the deck a little in that case.
   */
  const isTooSmallToSpreadOutDeck = useMediaQuery(NON_SPREADABLE_DECK_BREAKPOINT);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => void setIsHovered(false)); // improves mobile experience

  return (
    <Container
      ref={mergeRefs([containerRef, ref])}
      onMouseOver={() => void setIsHovered(true)}
      onMouseOut={() => void setIsHovered(false)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map(({ id, ...toastData }, toastIndex, arr) => (
          <AnimatedToast
            key={id}
            {...toastData}
            indexFromTopOfDeck={arr.length - toastIndex - 1}
            isDeckSpreadOut={!isTooSmallToSpreadOutDeck && isHovered}
            isDeckHovered={isHovered}
          />
        )
        )}
      </AnimatePresence>
    </Container>
  );
});

export default AnimatedToastsList;

const fluidMargin = composeFluidSize(
  { sizeToken: '--spacing-l', atBreakpoint: 360 },
  { sizeToken: '--spacing-xxxl', atBreakpoint: 640 },
  'vw'
);

const Container = styled(motion.section)`
  display: flex;
  
  position: fixed;
  right: ${fluidMargin};
  bottom: calc(${BOTTOM_NAVIGATION_HEIGHT} + ${vars('--spacing-m')});
  
  flex-direction: column;
  gap: ${vars('--spacing-s')};

  width: ${DEFAULT_TOAST_WIDTH}px;

  pointer-events: auto; /* guard against other modals disabling pointer events on "body" */

  z-index: 1000;

  @media (width > ${BOTTOM_MENU_BREAKPOINT}) { /* stylelint-disable-line media-query-no-invalid */
    bottom: ${vars('--spacing-xxxl')};
  }

  @media ${NON_SPREADABLE_DECK_BREAKPOINT} { /* stylelint-disable-line media-query-no-invalid */
    width: calc(100vw - 2 * ${fluidMargin});
  }
`;
