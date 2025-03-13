/* eslint-disable @typescript-eslint/consistent-type-definitions */
type EnvVars = import('zod').infer<typeof import('./envVarsSchema').default>;

interface ImportMetaEnv extends EnvVars {
  APP_VERSION: string,
}
