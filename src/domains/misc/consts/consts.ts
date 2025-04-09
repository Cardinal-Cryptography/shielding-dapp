import { UseQueryOptions } from '@tanstack/react-query';

export const BREAKPOINTS = { xs: '355px', sm: '500px', md: '770px', lg: '970px', xl: '1160px' };

export const BOTTOM_MENU_BREAKPOINT = '1100px';

export const BOTTOM_NAVIGATION_HEIGHT = '48px';

export const NEVER_CHANGING_DATA_OPTIONS = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} satisfies Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;

export const FAUCET_LINK = 'https://shielder-faucet.vercel.app/';
export const LANDING_PAGE_LINK = 'https://common.fi';
export const KNOWLEDGE_BASE_LINK = 'https://docs.common.fi/knowledge-base';
export const FEEDBACK_LINK='https://feedback.common.fi/?b=67f637404dea52efc92da1a6';
export const CHANGELOG_LINK = 'https://feedback.common.fi/changelog';
