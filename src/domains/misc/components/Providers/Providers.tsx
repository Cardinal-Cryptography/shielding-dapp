import { LazyMotion, domAnimation } from 'motion/react';
import { ReactNode } from 'react';

import GlobalStylesWithTheme from './GlobalStylesWithTheme';

type Props = {
  children: ReactNode,
};

const Providers = ({ children }: Props) => (
  <LazyMotion features={domAnimation}>
    <GlobalStylesWithTheme>
      {children}
    </GlobalStylesWithTheme>
  </LazyMotion>
);

export default Providers;
