import { themes } from './tokens';

type ThemeTokens = keyof (typeof themes)[keyof typeof themes];

/**
 * This function is made to resemble the notation of css variables as much as possible,
 * with added benefit of type safety allowing to use only defined variables:
 *
 * ```
 * color: ${vars('--color-foreground-1')};
 * ```
 */
export default <ThemeToken extends ThemeTokens>(themeToken: ThemeToken) => `var(${themeToken})` as const;
