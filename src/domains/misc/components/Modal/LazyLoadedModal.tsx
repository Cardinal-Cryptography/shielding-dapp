import * as RadixDialog from '@radix-ui/react-dialog';
import { useMediaQuery } from '@react-hookz/web';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CSSProperties,
  FC,
  forwardRef,
  ReactElement,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import styled, { css, RuleSet, ThemeProvider } from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import { IconName } from 'src/domains/misc/components/CIcon';
import Pager from 'src/domains/misc/components/Pager';
import * as Title from 'src/domains/misc/components/Title';
import withPropAs from 'src/domains/misc/utils/withPropAs';
import { backgroundFilters, boxShadows, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const SLIDE_IN_CARD_BREAKPOINT = 434;

type Title = string | ((PlainTextWrappingComponent: typeof RadixDialog.Title) => ReactElement);
type Children = ReactElement | ((close: () => Promise<unknown>) => ReactNode);

export type ModalRef = {
  open: () => void,
  close: () => void,
  contentElement: HTMLDivElement | null,
};

type PagedModalProps = {
  title?: Title[],
  children: Children[],
  currentPageIndex: number,
  onPreviousPageClick?: () => unknown,
  FirstPageTitleComponent?: FC<{ closeButton: ReactElement, children: ReactElement }>,
} | {
  title?: Title,
  children: Children,
  currentPageIndex?: never,
  onPreviousPageClick?: never,
  FirstPageTitleComponent?: never,
};

type Props = PagedModalProps & {
  /**
     * Either a plaintext title or a complex component, in which the plaintext title
     * is wrapped inside <PlainTextWrappingComponent>.
     */
  side?: 'right',
  /**
     * Must be an element accepting ref.
     */
  triggerElement?: ReactElement,
  onClose?: () => unknown,
  onOpen?: () => unknown,
  className?: string,
  style?: CSSProperties,
  additionalTitleRightSide?: ReactNode,
  isOpenInitially?: boolean,
  closeIcon?: IconName,
  nonDismissable?: boolean,
};

const LazyLoadedModal = forwardRef<ModalRef, Props>(({
  title: titleOrTitles,
  triggerElement,
  side,
  children: childrenOrChildrens,
  currentPageIndex,
  onPreviousPageClick,
  FirstPageTitleComponent: CustomFirstPageTitleComponent,
  additionalTitleRightSide,
  onClose,
  onOpen,
  className,
  style,
  isOpenInitially = false,
  closeIcon = 'Dismiss',
  nonDismissable,
}, ref) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);
  const [isVisible, setIsVisible] = useState(isOpenInitially);
  const isSlideInCardMode = useIsSlideInCardMode();
  const onCloseFinishedRef = useRef<(() => unknown) | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const initiateClosing = async () => {
    void setIsVisible(false);

    await new Promise<void>(resolve => {
      onCloseFinishedRef.current = resolve;
    });
  };

  useEffect(() => {
    if(isOpenInitially) {
      setIsVisible(true);
      setIsOpen(true);
    } else {
      void initiateClosing();
    }
  }, [isOpenInitially]);

  const finishClosing = () => {
    setIsOpen(false);
    onCloseFinishedRef.current?.();
    onClose?.();
  };

  const titles = Array.isArray(titleOrTitles) ? titleOrTitles : [titleOrTitles];
  const childrens = Array.isArray(childrenOrChildrens) ? childrenOrChildrens : [childrenOrChildrens];

  const FirstPageTitleComponent = CustomFirstPageTitleComponent ?? FirstPageTitle;

  type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

  const handleOutsidePointerDown = (e: PointerDownOutsideEvent) => {
    const target = e.target as Element;

    const shouldPrevent = !!nonDismissable || target.closest('w3m-modal') !== null;

    if (shouldPrevent) {
      e.preventDefault();
    }
  };

  useImperativeHandle(ref, () => ({
    close: () => void initiateClosing(),
    open: () => {
      setIsVisible(true);
      setIsOpen(true);
    },
    contentElement: contentRef.current,
  }));

  return (
    <ThemeProvider theme={{ containerSidePadding: vars('--spacing-xxl') }}>
      <Title.ProvideLeftBarAdditionalShift value={borderWidth}>
        <RadixDialog.Root
          open={isOpen}
          onOpenChange={newIsOpen => {
            if (newIsOpen) {
              setIsVisible(true);
              setIsOpen(true);
            } else {
              void initiateClosing();
            }
          }}
        >
          <RadixDialog.Trigger asChild>
            {triggerElement}
          </RadixDialog.Trigger>
          <RadixDialog.Portal>
            <OverlayContainer $side={side ?? 'center'}>
              <AnimatePresence>
                {isVisible && (
                  <Overlay
                    variants={overlayAnimationVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onAnimationComplete={variant => {
                      if (variant === 'exit') finishClosing();
                    }}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {isVisible && (
                  <ExitAnimationContainer
                    variants={isSlideInCardMode ? slideInCardAnimationVariants : getRegularModalAnimationVariants(side)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ContentContainer
                      ref={contentRef}
                      onOpenAutoFocus={e => void e.preventDefault()}
                      onPointerDownOutside={handleOutsidePointerDown}
                      $withExtendedBottomPadding={!!isSlideInCardMode}
                      aria-describedby={undefined} //  @radix requires `Description` or `aria-describedby={undefined}` for DialogContent
                      animate={{
                        opacity: 1, // adding an arbitrary, no-op style, because without it the "style" prop does not work
                      }}
                      layout
                      style={{
                        ...style,
                        // set as an inline style for scale correction during transition (https://www.framer.com/motion/layout-animations/##scale-correction)
                        borderRadius: vars('--border-radius-l'),
                      }}
                    >
                      <Pager
                        currentPageIndex={currentPageIndex ?? 0}
                        pages={[
                          () => (
                            <Content
                              key="first page"
                              className={className}
                              inert={currentPageIndex ? false : undefined}
                              $isSlideInCardMode={!!isSlideInCardMode}
                              $isRightSide={side === 'right'}
                            >
                              {titles[0] ? (
                                <FirstPageTitleComponent
                                  size="medium"
                                  // @ts-expect-error TS2322: "withPropAs" loses some type information in case of union types
                                  closeButton={[
                                    additionalTitleRightSide,
                                    !nonDismissable &&(
                                      <RadixDialog.Close key="close button" asChild>
                                        <CloseButton size="small" variant="transparent" leftIcon={closeIcon} />
                                      </RadixDialog.Close>
                                    ),
                                  ] as Iterable<ReactNode>}
                                >
                                  {typeof titles[0] === 'string' ? (
                                    <RadixDialog.Title>
                                      {titles[0]}
                                    </RadixDialog.Title>
                                  ) : titles[0](RadixDialog.Title)}
                                </FirstPageTitleComponent>
                              ) : <RadixDialog.Title hidden />}
                              {typeof childrens[0] === 'function' ? childrens[0](initiateClosing) : childrens[0]}
                            </Content>
                          ),
                          ...childrens.slice(1).map((children, i) => {
                            const title = titles[i+1];
                            return () => (
                              <Content
                                key={i+1}
                                className={className}
                                inert={currentPageIndex === i + 1 ? undefined : false}
                                $isSlideInCardMode={!!isSlideInCardMode}
                                $isRightSide={side === 'right'}
                              >
                                {title ? onPreviousPageClick ? (
                                  <SecondPageTitle>
                                    <Button
                                      variant="transparent"
                                      size="small"
                                      leftIcon="ChevronLeft"
                                      onClick={onPreviousPageClick}
                                    />
                                    {typeof title === 'string' ? (
                                      <RadixDialog.Title>
                                        {title}
                                      </RadixDialog.Title>
                                    ) : title(RadixDialog.Title)}
                                    {!nonDismissable && (
                                      <RadixDialog.Close asChild>
                                        <CloseButton size="small" variant="transparent" leftIcon="Dismiss" />
                                      </RadixDialog.Close>
                                    )}
                                  </SecondPageTitle>
                                ) : (
                                  <FirstPageTitleComponent
                                    size="medium"
                                    // @ts-expect-error TS2322: "withPropAs" loses some type information in case of union types
                                    closeButton={[
                                      additionalTitleRightSide,
                                      !nonDismissable &&(
                                        <RadixDialog.Close key="close button" asChild>
                                          <CloseButton size="small" variant="transparent" leftIcon={closeIcon} />
                                        </RadixDialog.Close>
                                      ),
                                    ] as Iterable<ReactNode>}
                                  >
                                    {typeof title === 'string' ? (
                                      <RadixDialog.Title>
                                        {title}
                                      </RadixDialog.Title>
                                    ) : title(RadixDialog.Title)}
                                  </FirstPageTitleComponent>
                                ) : <RadixDialog.Title hidden />}
                                {typeof children === 'function' ? children(initiateClosing) : children}
                              </Content>
                            );
                          }),
                        ]}
                      />
                    </ContentContainer>
                  </ExitAnimationContainer>
                )}
              </AnimatePresence>
            </OverlayContainer>
          </RadixDialog.Portal>
        </RadixDialog.Root>
      </Title.ProvideLeftBarAdditionalShift>
    </ThemeProvider>
  );
});

export default LazyLoadedModal;

type OverlayContainerProps = { $side: NonNullable<Props['side']> | 'center' };

const perSide = <T extends string | RuleSet>(sides: Record<OverlayContainerProps['$side'], T>) =>
  ({ $side }: OverlayContainerProps) => sides[$side];

const OverlayContainer = styled(RadixDialog.Overlay)<OverlayContainerProps>`
  display: grid;

  position: fixed;
  inset: 0;

  justify-items: ${perSide({
    center: 'center',
    right: 'flex-end',
  })};
  align-items: ${perSide({
    center: 'center',
    right: 'stretch',
  })};

  isolation: isolate;

  @media (max-width: ${SLIDE_IN_CARD_BREAKPOINT}px) { /* stylelint-disable-line media-query-no-invalid */
    justify-items: stretch;
    align-items: end;
  }
`;

const Overlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background-color: ${vars('--color-neutral-background-overlay-rest')};

  z-index: -1;
  ${backgroundFilters.backgroundBlur8}
`;

/*
  Setting "exit" animation on the <ContentContainer> itself does not work, probably because of Radix internal functioning.
  This container is trying to be as "transparent" for the layout as possible.
 */
const ExitAnimationContainer = styled(motion.div)`
  display: grid;
  justify-items: stretch;
  align-items: stretch;
  min-height: 0;
`;

const borderWidth = 1;
const backgroundColor = vars('--color-neutral-background-2-rest');
const bounceCompensatingBottomPadding = 40;

const ContentContainer = styled(motion(RadixDialog.Content))<{ $withExtendedBottomPadding: boolean }>`
  border: solid ${borderWidth}px transparent;
  margin: ${vars('--spacing-xxl')};
  min-height: 0;

  overflow: clip;
  background: ${vars('--color-neutral-background-2-rest')};
  outline: none;

  background-image:
    linear-gradient(${backgroundColor}, ${backgroundColor}),
    radial-gradient(100% 100% at 0% 0%, ${vars('--color-neutral-background-1-rest')} 0%, transparent 100%);

  /*
    Safari can't interpolate with channel alpha see https://stackoverflow.com/a/56548711,
    and relative color syntax doesn't have enough support.
  */
  @supports (color: rgb(from white r g b)) {
    background-image:
      linear-gradient(${backgroundColor}, ${backgroundColor}),
      radial-gradient(100% 100% at 0% 0%, ${vars('--color-neutral-background-1-rest')} 0%, rgb(from ${vars('--color-neutral-background-1-rest')} r g b / 0%) 100%);
  }

  background-origin: border-box;
  background-clip: padding-box, border-box;
  ${props => props.$withExtendedBottomPadding && css`
    padding-bottom: ${bounceCompensatingBottomPadding}px;
    margin: 0 0 -${bounceCompensatingBottomPadding}px 0;
    width: 100vw !important; /* we don't care about the width set by the consumer - we need to display the dialog in full width */
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `}
  ${boxShadows.shadow64};
`;

const Content = styled(motion.div)<{ $isSlideInCardMode: boolean, $isRightSide: boolean }>`
  display: flex;

  flex-direction: column;
  align-items: stretch;

  min-height: 0;
  max-height: ${({ $isRightSide }) => $isRightSide ? '100vh' : '94vh'};
  height: 100%;
  padding: ${vars('--spacing-xxl')};
  ${props => props.$isSlideInCardMode && css`
    height: auto;
    max-height: 90vh; /* fallback for browsers not supporting dvh */
    max-height: 90dvh;
  `}
`;

const FirstPageTitle = styled(withPropAs(Title.default, 'rightSide', 'closeButton')).attrs({
  size: 'medium',
})`
  padding-bottom: ${vars('--spacing-xxl')};

  flex-shrink: 0;
`;

const SecondPageTitle = styled.header`
  display: grid;

  align-items: center;
  grid-template-columns: auto 1fr auto;

  padding-bottom: ${vars('--spacing-xxl')};

  text-align: center;
  white-space: nowrap;
  
  ${typography.decorative.subtitle2}
`;

const CloseButton = styled(Button)`
  padding-right: 0;
`;

const overlayAnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.2 }},
};

const getSlideInConfig = (side: Props['side']) => ({
  center: { y: 20 },
  right: { x: 20 },
}[side ?? 'center']);

const getRegularModalAnimationVariants = (side: Props['side']) => ({
  initial: { opacity: 0, ...getSlideInConfig(side) },
  animate: { opacity: 1, x: 0, y: 0, transition: { delay: 0.2 }},
  exit: { opacity: 0, ...getSlideInConfig(side), transition: { delay: 0 }},
});

const slideInCardAnimationVariants = {
  initial: { opacity: 0, y: 150 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.2 }},
  exit: { opacity: 0, y: 150, transition: { delay: 0 }},
};

export const useIsSlideInCardMode = () => useMediaQuery(`(width <= ${SLIDE_IN_CARD_BREAKPOINT}px)`);
