import type { ReactNode } from 'react';
import styled from 'styled-components';

import { BREAKPOINTS } from 'src/domains/common/styles/tokens';
import { vars } from 'src/domains/common/styles/utils';

import AnimatingBackground from './AnimatingBackground';
import Footer from './Footer';
import TopBar from './TopBar';

type Props = {
  children: ReactNode,
};

const Layout = ({ children }: Props) => (
  <Wrapper>
    <Container>
      <TopBar />
      <Main>
        {children}
      </Main>
      <Footer />
    </Container>
    <AnimatingBackground />
  </Wrapper>
);

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
