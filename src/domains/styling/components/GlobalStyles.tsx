import { createGlobalStyle } from 'styled-components';
import cssReset from 'styled-reset';

import { primitives, themes } from '../utils/tokens';
import vars from '../utils/vars';

const primitivesString = Object.entries(primitives)
  .map(([property, value]) => `${property}: ${value};`).join('\n');

const stringifyThemeObject = (themeObject: Record<string, string>) =>
  Object.entries(themeObject)
    .map(([property, value]) => `${property}: var(${value});`)
    .join('\n');

const themesStrings = Object.fromEntries(
  Object.entries(themes).map(([themeName, themeObject]) => [
    themeName,
    stringifyThemeObject(themeObject),
  ])
);

export default createGlobalStyle<{ currentTheme: keyof typeof themes }>`
  ${cssReset}
  
  * {
    box-sizing: border-box;
    text-rendering: optimizelegibility;

    --webkit-font-smoothing: antialiased;
    --moz-osx-font-smoothing: grayscale;
  }

  button { /* https://www.trysmudford.com/blog/a-good-reset/ */
    padding: 0;
    border: none;

    color: inherit;
    text-align: inherit;

    border-radius: 0;
    background: none;
    box-shadow: none;
    cursor: pointer;

    appearance: none;
    font: inherit;
  }

  a {
    color: currentcolor; 

    text-decoration: none;
  }

  body {
    color: ${vars('--color-neutral-foreground-1-rest')};
    background: linear-gradient(
        180deg,
        ${vars('--color-neutral-background-gradient-color-a')} 0%,
        ${vars('--color-neutral-background-gradient-color-b')} 100%
    ) fixed, ${vars('--color-neutral-background-gradient-color-b')} /* fixes white piece of background during mobile UI hiding upon scroll */;
  }

  :root {
    ${primitivesString}
    
    ${({ currentTheme }) => (themesStrings)[currentTheme]}
  }
`;
