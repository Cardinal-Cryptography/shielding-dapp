import { UseQueryOptions } from '@tanstack/react-query';

export const BREAKPOINTS = { xs: '355px', sm: '500px', md: '770px', lg: '970px', xl: '1160px' };

export const BOTTOM_MENU_BREAKPOINT = BREAKPOINTS.lg;

export const BOTTOM_NAVIGATION_HEIGHT = '48px';

export const NEVER_CHANGING_DATA_OPTIONS = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} satisfies Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;
