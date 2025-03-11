/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginSvgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    vitePluginSvgr(),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.[jt]s?(x)'],
  },
});
