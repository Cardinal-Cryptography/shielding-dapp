import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { themes } from '../styles/tokens';

type Theme = keyof typeof themes | 'system';

type ThemeStore = {
  theme: Theme,
  setTheme: (theme: Theme) => void,
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      theme: 'system',
      setTheme: theme => {
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
      partialize: state => ({ theme: state.theme }),
    }
  )
);
