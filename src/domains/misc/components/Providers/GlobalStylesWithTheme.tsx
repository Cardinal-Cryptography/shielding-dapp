import { ReactNode } from 'react';

import GlobalStyles from 'src/domains/styling/components/GlobalStyles';
import { useTheme } from 'src/domains/styling/utils/useTheme';

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
