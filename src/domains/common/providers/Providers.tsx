import { ReactNode } from 'react';

import GlobalStylesWithTheme from './GlobalStylesWithTheme';

type Props = {
  children: ReactNode,
};

const Providers = ({ children }: Props) => (
  <GlobalStylesWithTheme>
    {children}
  </GlobalStylesWithTheme>
);

export default Providers;
