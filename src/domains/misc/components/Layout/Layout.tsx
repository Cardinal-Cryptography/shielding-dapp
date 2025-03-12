import { useMediaQuery } from '@react-hookz/web';
import { useLocation } from '@swan-io/chicane';
import { type ReactNode, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { BREAKPOINTS, BOTTOM_NAVIGATION_HEIGHT, BOTTOM_MENU_BREAKPOINT } from 'src/domains/common/styles/tokens';
import { vars } from 'src/domains/common/styles/utils';

import AnimatingBackground from './AnimatingBackground';
import Footer from './Footer';
import Navigation from './Navigation';
import TopBar from './TopBar';

type Props = {
  children: ReactNode,
};

const Layout = ({ children }: Props) => {
  const isMobile = useMediaQuery(`(max-width: ${BOTTOM_MENU_BREAKPOINT})`);
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo(0, 0);
  }, [location]);

  return (
    <Wrapper>
      <Container ref={containerRef}>
        <TopBar />
        <Main>
          {children}
        </Main>
        <Footer />
      </Container>
      {isMobile && (
        <BottomNavigationContainer>
          <BottomNavigationContent position="ceiling" />
        </BottomNavigationContainer>
      )}
      <AnimatingBackground />
    </Wrapper>
  );
};

export default Layout;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh; /* fallback for browsers not supporting dvh */
  height: 100dvh;
`;

const Container = styled.div`
  /*
    Can't be flexbox, because in case of the "main" content exceeding the container width,
    it overflows the container, instead of extending it.
  */
  display: grid;

  grid-template-rows: auto 1fr auto;
  flex: 1;
  flex-direction: column;

  overflow: auto;

  z-index: 0;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: ${vars('--spacing-s')};
  
  @media (width >= ${BREAKPOINTS.sm}) { /* stylelint-disable-line media-query-no-invalid */
    padding: ${vars('--spacing-s')} ${vars('--spacing-xl')} ${vars('--spacing-xl')};
  }
  
  @media (width >= ${BREAKPOINTS.md}) { /* stylelint-disable-line media-query-no-invalid */
    padding: ${vars('--spacing-s')} ${vars('--spacing-xxxl')} ${vars('--spacing-xxxl')};
  }
`;

const BottomNavigationContainer = styled.div`
  display: flex;

  justify-content: center;

  height: ${BOTTOM_NAVIGATION_HEIGHT};
  width: 100%;

  background: ${vars('--color-neutral-background-2-rest')};

  border-top: 1px solid ${vars('--color-neutral-stroke-2-rest')};
`;

const BottomNavigationContent = styled(Navigation)`
    gap: ${vars('--spacing-l')};
`;
