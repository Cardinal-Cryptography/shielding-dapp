import { QueryClient, QueryClientProvider as Provider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export default queryClient;

type Props = {
  children: ReactNode,
};

export const QueryClientProvider = ({ children }: Props) => (
  <Provider client={queryClient}>
    {children}
  </Provider>
);
