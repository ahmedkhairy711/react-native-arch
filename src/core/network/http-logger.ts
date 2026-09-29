import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { toCurl } from './curl';

type TimedConfig = InternalAxiosRequestConfig & { metadata?: { start: number } };

/**
 * DEV ONLY. Logs every request as cURL + response status/timing.
 * http-client.ts requires this file inside `if (__DEV__)`, so Metro drops it from release bundles.
 */
export function attachHttpLogger(instance: AxiosInstance) {
  instance.interceptors.request.use((config: TimedConfig) => {
    config.metadata = { start: Date.now() };
    console.log(`🌐 ➡️ ${config.method?.toUpperCase()} ${config.url}\n${toCurl(config)}`);
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const config = response.config as TimedConfig;
      console.log(
        `🌐 ✅ ${response.status} ${config.method?.toUpperCase()} ${config.url} (${elapsed(config)})`,
        response.data,
      );
      return response;
    },
    (error: { config?: TimedConfig; response?: { status: number; data: unknown }; message: string }) => {
      const config = error.config;
      console.log(
        `🌐 ❌ ${error.response?.status ?? error.message} ${config?.method?.toUpperCase()} ${config?.url} (${elapsed(config)})`,
        error.response?.data ?? '',
      );
      return Promise.reject(error);
    },
  );
}

function elapsed(config?: TimedConfig) {
  return config?.metadata ? `${Date.now() - config.metadata.start}ms` : '?';
}
