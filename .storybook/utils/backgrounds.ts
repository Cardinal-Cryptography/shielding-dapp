import { primitives, themes } from '../../src/domains/styling/utils/tokens';

export const LIGHT = {
  name: 'light',
  value: primitives[themes.light['--color-neutral-background-gradient-color-a']],
};

export const DARK = {
  name: 'dark',
  value: primitives[themes.dark['--color-neutral-background-gradient-color-a']],
};

export const DEFAULT = {
  name: 'default',
  value: 'transparent', // uncovers the default app background set with global styles
};
