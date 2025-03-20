/// <reference types="vitest" />
import path from 'path';

import react from '@vitejs/plugin-react';
import { objectEntries, objectFromEntries } from 'tsafe';
import { defineConfig, loadEnv, normalizePath } from 'vite';
import vitePluginSvgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import envVarsSchema from './envVarsSchema';
import { version } from './package.json';

// https://vite.dev/config/
export default defineConfig({
  envPrefix: 'PUBLIC_VAR_',
  plugins: [
    tsconfigPaths(),
    react(),
    vitePluginSvgr(),
    {
      name: 'vite-plugin-validate-env',
      config: (userConfig, { mode }) => {
        const resolvedRoot = normalizePath(
          userConfig.root ? path.resolve(userConfig.root) : process.cwd()
        );
        const envDir = userConfig.envDir ?
          normalizePath(path.resolve(resolvedRoot, userConfig.envDir)) :
          resolvedRoot;

        const env = loadEnv(mode, envDir, userConfig.envPrefix);

        const parsingResult = envVarsSchema.safeParse(env);

        if (!parsingResult.success) {
          throw new Error(
            `Some env vars are not valid: ${JSON.stringify(
              parsingResult.error.format(),
              undefined,
              2
            )}`
          );
        }

        const parsedEnvVars = objectFromEntries(objectEntries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]));

        return {
          define: parsedEnvVars,
        };
      },
    },
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.[jt]s?(x)'],
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(version),
  },
});
