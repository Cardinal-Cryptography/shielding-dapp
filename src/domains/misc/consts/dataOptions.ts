import { UseQueryOptions } from '@tanstack/react-query';

export const NEVER_CHANGING_DATA_OPTIONS = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} satisfies Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;
