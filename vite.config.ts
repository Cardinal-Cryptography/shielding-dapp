/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import vitePluginSvgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import envVarsSchema from './envVarsSchema';
import { version } from './package.json';

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const parsingResult = await envVarsSchema.safeParseAsync(env);

  if (!parsingResult.success) {
    throw new Error(
      `Some env vars are not valid: ${JSON.stringify(
        parsingResult.error.format(),
        undefined,
        2
      )}`
    );
  }
  return {
    plugins: [
      tsconfigPaths(),
      react(),
      vitePluginSvgr(),
    ],
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.[jt]s?(x)'],
    },
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(version),
    },
  };
});
