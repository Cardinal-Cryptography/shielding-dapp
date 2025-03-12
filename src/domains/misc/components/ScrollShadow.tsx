import { useMotionValueEvent, useScroll } from 'motion/react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

type Props = {
  children: ReactNode,
  className?: string,
};

const ScrollShadow = ({ children, className }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll({ container: ref });
  const [isScrolledTop, setIsScrolledTop] = useState(false);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);

  const updateScrollState = () => {
    const el = ref.current;
    if (!el) return;

    const { clientHeight, scrollHeight, scrollTop } = el;

    setIsScrolledTop(scrollTop > 0);
    setIsScrolledBottom(scrollHeight > clientHeight && scrollTop < (scrollHeight - clientHeight));
  };

  useEffect(() => {
    updateScrollState();
  }, []);

  useMotionValueEvent(scrollY, 'change', updateScrollState);

  return (
    <Container
      $isScrolledTop={isScrolledTop}
      $isScrolledBottom={isScrolledBottom}
      ref={ref}
      className={className}
    >
      {children}
    </Container>
  );
};

export default ScrollShadow;

const Container = styled.div<{ $isScrolledTop: boolean, $isScrolledBottom: boolean }>`
  width: min(100vw, 440px);
  overflow-y: auto;

  mask-composite: intersect;

  ${({ $isScrolledTop, $isScrolledBottom }) => {
    if ($isScrolledTop && $isScrolledBottom) {
      return css`
        mask-image: linear-gradient(to bottom, transparent, black 40px),
        linear-gradient(to top, transparent, black 40px);
      `;
    }

    if ($isScrolledTop) {
      return css`
        mask-image: linear-gradient(to bottom, transparent, black 40px);
      `;
    }

    if ($isScrolledBottom) {
      return css`
        mask-image: linear-gradient(to top, transparent, black 40px);
      `;
    }
  }}
`;
