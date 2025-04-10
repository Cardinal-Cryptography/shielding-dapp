/// <reference types="vitest" />
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'path';

import react from '@vitejs/plugin-react';
import { objectEntries, objectFromEntries } from 'tsafe';
import { defineConfig, loadEnv, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import vitePluginSvgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { parse } from 'yaml';

import envVarsSchema from './envVarsSchema';
import { version } from './package.json';
const customHttpPath = path.resolve(__dirname, 'customHttp.yml');
const customHttpContent = fs.readFileSync(customHttpPath, 'utf8');
const { customHeaders } = parse(customHttpContent) as {
  customHeaders: { pattern: string, headers: { key: string, value: string }[] }[],
};

const globalHeaders =
    customHeaders
      .filter(h => h.pattern === '**/*')
      .flatMap(h => h.headers);

const crossOriginIsolationMiddleware = (_: IncomingMessage, res: ServerResponse, next: () => void): void => {
  globalHeaders.forEach(({ key, value }) => {
    res.setHeader(key, value);
  });
  next();
};

// https://vite.dev/config/
export default defineConfig({
  envPrefix: 'PUBLIC_VAR_',
  plugins: [
    tsconfigPaths(),
    react(),
    vitePluginSvgr(),
    viteStaticCopy({
      targets: [
        {
          src: 'customHttp.yml',
          dest: '.',
        },
      ],
    }),
    {
      name: 'configure-server',
      configureServer: server => {
        server.middlewares.use(crossOriginIsolationMiddleware);
      },
      configurePreviewServer: server => {
        server.middlewares.use(crossOriginIsolationMiddleware);
      },
    },
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

        const parsedEnvVars = objectFromEntries(
          objectEntries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
        );

        return {
          define: parsedEnvVars,
        };
      },
    },
  ],
  optimizeDeps: {
    exclude: ['@cardinal-cryptography/shielder-sdk-crypto-wasm'],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.[jt]s?(x)'],
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(version),
  },
});
