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
export const LANDING_PAGE_LINK = 'https://blanksquare.io';
export const KNOWLEDGE_BASE_LINK = 'https://docs.blanksquare.io/knowledge-base/web-app-user-guide';
export const STATISTICS_LINK = 'https://stats.blanksquare.io/';
export const FEEDBACK_LINK='https://feedback.blanksquare.io/?b=67f637404dea52efc92da1a6';
export const CHANGELOG_LINK = 'https://feedback.blanksquare.io/changelog';
export const BEST_PRACTICES_LINK = 'https://docs.blanksquare.io/knowledge-base/shielding/privacy-best-practices';
export const FRAUD_PROTECTION_LINK = 'https://docs.blanksquare.io/knowledge-base/fraud-protection';
export const TERMS_OF_SERVICE_LINK = 'https://blanksquare.io/terms-of-service-webapp';
export const TERMS_OF_CONDITIONS_LINK = 'https://blanksquare.io/terms-and-conditions-shielder-service';
export const PRIVACY_POLICY_LINK = 'https://blanksquare.io/privacy-policy-webapp';
export const KEY_GENERATION_PROCESS_LINK = 'https://docs.blanksquare.io/knowledge-base/shielding/key-generation-process';
