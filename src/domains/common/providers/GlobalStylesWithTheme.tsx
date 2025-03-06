import { ReactNode } from 'react';

import { useTheme } from '../hooks/useTheme';
import GlobalStyles from '../styles/GlobalStyles';

type Props = {
  children: ReactNode,
};

const GlobalStylesWithTheme = ({ children }: Props) => {
  const { activeTheme } = useTheme();

  return (
    <>
      <GlobalStyles currentTheme={activeTheme} />
      {children}
    </>
  );
};

export default GlobalStylesWithTheme;
