import { LazyMotion, domAnimation } from 'motion/react';
import { ReactNode } from 'react';

import { QueryClientProvider } from 'src/domains/misc/utils/queryClient';

import GlobalStylesWithTheme from './GlobalStylesWithTheme';

type Props = {
  children: ReactNode,
};

const Providers = ({ children }: Props) => (
  <LazyMotion features={domAnimation}>
    <GlobalStylesWithTheme>
      <QueryClientProvider>
        {children}
      </QueryClientProvider>
    </GlobalStylesWithTheme>
  </LazyMotion>
);

export default Providers;
