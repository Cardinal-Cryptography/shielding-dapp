export const primitives = {
  '--black': '#000000',
  '--white': '#ffffff',
};

type ThemeName = string;
type ThemeToken = string;
type PrimitiveToken = keyof typeof primitives;

/**
 * While themes in the app are generally carried out using css variables, the tokens are in a form
 * of js objects to be equally easily accessible in js as in css, serving a single source of truth
 * for both worlds.
 *
 * The values of the theme objects are the keys of the "primitives" object.
 */
export const themes = {
  light: {
    '--foreground': '--black',
    '--background': '--white',
  },
  dark: {
    '--foreground': '--white',
    '--background': '--black',
  },
} as const satisfies Record<ThemeName, Record<ThemeToken, PrimitiveToken>>;

export const typography = {};

export const backgroundFilters = {};

export const boxShadows = {};

export const transitionTime = '0.2s';
