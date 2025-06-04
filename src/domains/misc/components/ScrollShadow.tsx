import { useMotionValueEvent, useScroll } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';
import SimpleBar from 'simplebar-react';
import styled, { css } from 'styled-components';

import vars from 'src/domains/styling/utils/vars';
import 'simplebar-react/dist/simplebar.min.css';

type Props = {
  children: ReactNode,
  className?: string,
  fadePosition?: 'top' | 'bottom' | 'both',
  maxHeight?: `${string}px` | `${string}%`,
};

const ScrollShadow = ({ children, className, fadePosition = 'both', maxHeight }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll({ container: ref });
  const [isScrolledTop, setIsScrolledTop] = useState(false);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);

  const isTopFadeVisible = (fadePosition === 'top' || fadePosition === 'both') && isScrolledTop;
  const isBottomFadeVisible = (fadePosition === 'bottom' || fadePosition === 'both') && isScrolledBottom;

  const updateScrollState = () => {
    const el = ref.current;
    if (!el) return;

    const { clientHeight, scrollHeight, scrollTop } = el;
    const isNotTop = scrollTop > 0;
    const isNotBottom = scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight;

    setIsScrolledTop(isNotTop);
    setIsScrolledBottom(isNotBottom);
  };

  useEffect(() => {
    updateScrollState();
  }, []);

  useMotionValueEvent(scrollY, 'change', updateScrollState);

  return (
    <Container
      scrollableNodeProps={{ ref }}
      className={className}
      $isScrolledTop={isTopFadeVisible}
      $isScrolledBottom={isBottomFadeVisible}
      style={{ maxHeight }}
    >
      {children}
    </Container>
  );
};

export default ScrollShadow;

const Container = styled(SimpleBar)<{ $isScrolledTop: boolean, $isScrolledBottom: boolean }>`
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
  
  .simplebar-scrollbar::before {
    background-color: ${vars('--color-neutral-background-scrollbar-overlay-rest')}; 
    opacity: 1;
  }

  .simplebar-track { 
    width: ${vars('--spacing-s')};
    background: transparent;
  }

  &:hover .simplebar-scrollbar::before {
    background-color: ${vars('--color-neutral-background-scrollbar-overlay-rest')};
  }
`;
