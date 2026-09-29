import Constants from 'expo-constants';
import { z } from 'zod';

/** Runtime config injected by app.config.ts (`extra`). Validated once so a bad build fails fast. */
const envSchema = z.object({
  appEnv: z.enum(['development', 'staging', 'production']),
  env: z.object({
    apiUrl: z.url(),
    enableHttpLogs: z.boolean(),
    blockCompromisedDevices: z.boolean(),
    sslPins: z.record(z.string(), z.array(z.string())),
  }),
});

const parsed = envSchema.parse(Constants.expoConfig?.extra);

export const env = {
  appEnv: parsed.appEnv,
  ...parsed.env,
  isProduction: parsed.appEnv === 'production',
} as const;

export type Env = typeof env;
