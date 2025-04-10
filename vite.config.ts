/// <reference types="vitest" />
import childProcess from 'child_process';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'path';

import react from '@vitejs/plugin-react';
import semverRegex from 'semver-regex';
import { objectEntries, objectFromEntries } from 'tsafe';
import { defineConfig, loadEnv, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import vitePluginSvgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { parse } from 'yaml';

import envVarsSchema from './envVarsSchema';
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
    {
      name: 'app-version',
      config: async () => {
        const [
          tag,
          commitHash,
        ] = await Promise.all([
          new Promise<string | undefined>((resolve, reject) => {
            childProcess.exec('git tag --points-at HEAD', (err, stdout) => {
              if (err) reject(err);
              else {
                const probablyMostRecentTag =
                  // eslint-disable-next-line no-restricted-syntax
                  stdout
                    .trim()
                    .split('\n')
                    .sort() // we can't determine the chronological order of lightweight tags, so we hope that the alphabetical order matches chronology
                    .at(-1);

                resolve(probablyMostRecentTag);
              }
            });
          }),
          new Promise<string>((resolve, reject) => {
            childProcess.exec('git rev-parse --short HEAD', (err, stdout) => {
              if (err) reject(err);
              else resolve(stdout.trim());
            });
          }),
        ]);

        if (tag && !semverRegex().test(tag)) {
          throw new Error(`The tag "${tag}" does not follow the semver format.`);
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const appVersion = tag || commitHash;

        return {
          define: {
            'import.meta.env.APP_VERSION': JSON.stringify(appVersion),
          },
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
});
