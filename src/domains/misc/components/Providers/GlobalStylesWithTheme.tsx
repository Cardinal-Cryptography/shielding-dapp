import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

import GlobalStyles from 'src/domains/styling/components/GlobalStyles';
import { useTheme } from 'src/domains/styling/utils/useTheme';
import vars from 'src/domains/styling/utils/vars.ts';

type Props = {
  children: ReactNode,
};

const GlobalStylesWithTheme = ({ children }: Props) => {
  const { activeTheme } = useTheme();

  return (
    <>
      <GlobalStyles currentTheme={activeTheme} />
      <ThemeProvider theme={{ containerSidePadding: vars('--spacing-l') }}>
        {children}
      </ThemeProvider>
    </>
  );
};

export default GlobalStylesWithTheme;
