import { useMediaQuery } from '@react-hookz/web';
import { useAppKitTheme } from '@reown/appkit/react';
import { useEffect } from 'react';

import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const { theme, ...rest } = useThemeStore();
  const { setThemeMode } = useAppKitTheme();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const systemTheme = prefersDarkMode ? 'dark' : 'light';
  const activeTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    setThemeMode(activeTheme);
  }, [activeTheme, setThemeMode]);

  return { activeTheme, userSelectedTheme: theme, ...rest };
};
