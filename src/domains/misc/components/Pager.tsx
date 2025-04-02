import { usePrevious } from '@react-hookz/web';
import { AnimatePresence, m as motion, Variants } from 'framer-motion';
import { ReactElement, useLayoutEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

type FramerCustomProps = {
  direction: number,
  size: { width: number },
};

// "x" is not the perfect size - just an approximation, because there's no access to the appearing child's ref and therefore the target width
const variants: Variants = {
  initial: ({ direction, size }: FramerCustomProps) => ({
    x: direction > 0 ? size.width : -size.width,
    opacity: 0,
    zIndex: 1,
  }),
  entered: () => ({
    x: 0,
    opacity: 1,
    zIndex: 1,
  }),
  exit: ({ direction, size }: FramerCustomProps) => ({
    x: direction < 0 ? size.width : -size.width,
    opacity: 0,
    zIndex: 0,
  }),
};

type RenderPage = () => ReactElement;

type Props = {
  currentPageIndex: number,
  pages: RenderPage[],
};

const Pager = ({ currentPageIndex, pages }: Props) => {
  const direction = usePagingDirection(currentPageIndex);
  const [size, setSize] = useState<{ width: number }>({ width: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    setSize({ width: containerRef.current.clientWidth });
  }, [currentPageIndex]);

  const framerCustomProps: FramerCustomProps = { direction, size };

  return (
    <Container layout ref={containerRef}>
      <AnimatePresence initial={false} mode="popLayout" custom={framerCustomProps}>
        <Page
          key={currentPageIndex}
          layout
          custom={framerCustomProps}
          variants={variants}
          initial="initial"
          animate="entered"
          exit="exit"
          transition={{ x: { ease: 'linear' }}}
        >
          {pages[currentPageIndex]()}
        </Page>
      </AnimatePresence>
    </Container>
  );
};

export default Pager;

const usePagingDirection = (currentPageIndex: number) => {
  const [initialPageIndex] = useState(currentPageIndex);
  const previousPageIndex = usePrevious(currentPageIndex) ?? initialPageIndex;

  return currentPageIndex - previousPageIndex;
};

const LayoutAgnosticAnimationContainer = styled(motion.div)`
  display: flex;

  flex: 1;
  flex-direction: column;
  align-items: stretch;

  min-height: 0;
  height: 100%;
`;

const Container = styled(LayoutAgnosticAnimationContainer)`
  position: relative;
`;

const Page = styled(LayoutAgnosticAnimationContainer)``;
