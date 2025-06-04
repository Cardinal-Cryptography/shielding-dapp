import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ComponentProps, ReactElement, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import useHasHoverCapability from 'src/domains/misc/utils/useHasHoverCapability';
import { boxShadows, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  text: ReactElement | string,
  disabled?: boolean,
  side?: ComponentProps<typeof RadixTooltip.Content>['side'],
  align?: ComponentProps<typeof RadixTooltip.Content>['align'],
  /**
   * Requirements regarding a tooltip child: https://www.radix-ui.com/primitives/docs/guides/composition
   */
  children: ReactElement,
};

const LazyLoadedTooltip = ({ text, disabled, side, align, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const isHoverNotSupported = !useHasHoverCapability();

  const isOpenMobile = disabled !== true && isOpen;
  const isOpenDesktop = disabled === true ? false : undefined;

  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root
        open={isHoverNotSupported ? isOpenMobile : isOpenDesktop}
        onOpenChange={isHoverNotSupported ? setIsOpen : undefined}
      >
        <RadixTooltip.Trigger asChild onClick={() => void setIsOpen(true)}>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <StyledContent side={side} align={align} arrowPadding={4 /* same as the border radius */}>
            {text}
            <StyledArrow />
          </StyledContent>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default LazyLoadedTooltip;

const backgroundColorCssVar = vars('--color-neutral-background-1-rest');

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const slideLeft = keyframes`
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
`;
const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

const StyledContent = styled(RadixTooltip.Content)`
  padding-top: ${vars('--spacing-s')};
  padding-bottom: ${vars('--spacing-m-nudge')};
  padding-inline: ${vars('--spacing-m')};
  max-width: 240px;

  
  color: ${vars('--color-neutral-foreground-2-rest')};
  
  background-color: ${backgroundColorCssVar};
  border-radius: ${vars('--border-radius-xs')};
  
  animation-duration: 0.75s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  
  z-index: 9999; /* so its always on top of other components */
  
  ${boxShadows.shadow08}

  &[data-side='top'] { animation-name: ${slideUp}; }
  &[data-side='bottom'] { animation-name: ${slideDown}; }
  &[data-side='left'] { animation-name: ${slideLeft}; }
  &[data-side='right'] { animation-name: ${slideRight}; }
  
  ${typography.web.caption1}
`;

const StyledArrow = styled(RadixTooltip.Arrow)`
  width: 0;
  height: 0;

  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid ${backgroundColorCssVar};
`;
