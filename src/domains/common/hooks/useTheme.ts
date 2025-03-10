import { useMediaQuery } from 'usehooks-ts';

import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const { theme, ...rest } = useThemeStore();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const systemTheme = prefersDarkMode ? 'dark' : 'light';
  const activeTheme = theme === 'system' ? systemTheme : theme;

  return { activeTheme, userSelectedTheme: theme, ...rest };
};
