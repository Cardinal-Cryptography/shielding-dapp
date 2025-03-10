import { createGlobalStyle } from 'styled-components';
import cssReset from 'styled-reset';

import { primitives, themes } from './tokens';
import { vars } from './utils';

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


  body {
    color: ${vars('--foreground')};
    background: ${vars('--background')};
  }

  :root {
    ${primitivesString}
    
    ${({ currentTheme }) => (themesStrings)[currentTheme]}
  }
`;
