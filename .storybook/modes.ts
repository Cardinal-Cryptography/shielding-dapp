import { themes } from '../src/domains/styling/utils/tokens';

import preview from './preview';
import * as backgrounds from './utils/backgrounds';

const themeModes = {
  light: {
    backgrounds: backgrounds.LIGHT,
    theme: 'light',
  },
  dark: {
    backgrounds: backgrounds.DARK,
    theme: 'dark',
  },
} as const;

export const allModes = {
  light: themeModes.light,
  dark: themeModes.dark,
  'light desktop': {
    viewport: 'desktop',
    ...themeModes.light,
  },
  'light mobile': {
    viewport: 'mobile',
    ...themeModes.light,
  },
  'dark desktop': {
    viewport: 'desktop',
    ...themeModes.dark,
  },
  'dark mobile': {
    viewport: 'mobile',
    ...themeModes.dark,
  },
} satisfies Record<string, Partial<{
  viewport: keyof typeof preview.parameters.viewport.viewports,
  theme: keyof typeof themes,
  backgrounds: (typeof backgrounds)[keyof typeof backgrounds],
}>>;
