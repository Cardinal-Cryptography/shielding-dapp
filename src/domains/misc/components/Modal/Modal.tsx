import { AnimatePresence, motion } from 'framer-motion';
import { MouseEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import Pager from 'src/domains/misc/components/Pager';
import * as Title from 'src/domains/misc/components/Title';
import { useToast } from 'src/domains/misc/components/Toast';
import { boxShadows } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { useModalControls } from './ModalProvider';

type Config = {
  title?: string | ReactElement,
  content: ReactElement,
};

type Props = {
  className?: string,
  page?: number,
  nonDismissible?: boolean,
  onClose?: () => void,
  config: Config | Config[],
};

const Modal = ({
  config,
  nonDismissible,
  className,
  page = 0,
}: Props) => {
  const { isLast, close, isTopModal } = useModalControls();
  const ref = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { isDomNodeInToastsTree } = useToast();

  const triggerClose = useCallback(() => {
    if(isLast) {
      close();
    }
    setIsClosing(true);
  }, [close, isLast]);

  const handleClickOutside = (e: MouseEvent<HTMLDivElement>) => {
    if (nonDismissible) return;
    if (!ref.current || ref.current.contains(e.target as Node)) return;
    const walletConnectModal = document.querySelector('[class*="walletconnect"]');
    if (
      isDomNodeInToastsTree(e.target as Node) ||
      walletConnectModal?.contains(e.target as Node)
    ) {
      return;
    }
    triggerClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !nonDismissible) {
        triggerClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => void document.removeEventListener('keydown', handleEsc);
  }, [nonDismissible, triggerClose]);

  const pages = Array.isArray(config) ? config : [config];

  return (
    <Title.ProvideLeftBarAdditionalShift value={8}>
      <ModalWrapper style={{ pointerEvents: isTopModal ? 'auto' : 'none' }} onClick={handleClickOutside}>
        <AnimatePresence onExitComplete={isTopModal ? () => void close() : undefined}>
          {(!isClosing && isTopModal) && (
            <ModalContent
              ref={ref}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={className}
              layout
            >
              {(!!pages[page].title || !nonDismissible) && (
                <ModalHeader>
                  {pages[page].title ? <StyledTitle size="medium">{pages[page].title}</StyledTitle> : <div />}
                  {!nonDismissible && (
                    <CloseButton
                      size="small"
                      variant="transparent"
                      leftIcon="Dismiss"
                      onClick={triggerClose}
                    />
                  )}
                </ModalHeader>
              )}
              <Pager currentPageIndex={page}
                pages={
                  pages.map(page => () => page.content)
                }
              />
            </ModalContent>
          )}
        </AnimatePresence>
      </ModalWrapper>
    </Title.ProvideLeftBarAdditionalShift>
  );
};

export default Modal;

const variants = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: 40, opacity: 0 },
};

const SLIDE_IN_CARD_BREAKPOINT = 434;

const ModalWrapper = styled.div`
  display: grid;
  position: fixed;
  inset: 0;
  justify-items: center;
  align-items: center;

  @media (max-width: ${SLIDE_IN_CARD_BREAKPOINT}px) { /* stylelint-disable-line media-query-no-invalid */
    align-items: end;
  }
`;

const ModalContent = styled(motion.create(DoubleBorderBox.Content))`
  width: min(${SLIDE_IN_CARD_BREAKPOINT}px, 100dvw);
  max-height: 90vh;
  margin: 0;
  overflow: clip;
  ${boxShadows.shadow64};

  @media (max-width: ${SLIDE_IN_CARD_BREAKPOINT}px) { /* stylelint-disable-line media-query-no-invalid */
    border-bottom-left-radius: ${vars('--border-radius-none')};
    border-bottom-right-radius: ${vars('--border-radius-none')};
  }
`;

const ModalHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-bottom: 16px;
`;

const CloseButton = styled(Button)`
  padding-right: 0;
`;

const StyledTitle = styled(Title.default)``;
