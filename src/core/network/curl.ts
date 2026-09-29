import type { InternalAxiosRequestConfig } from 'axios';

/** Builds a copy-pasteable cURL command for a request (dev tooling only). */
export function toCurl(config: InternalAxiosRequestConfig): string {
  const method = (config.method ?? 'get').toUpperCase();
  const url = buildUrl(config);
  const parts = [`curl -X ${method} ${quote(url)}`];

  const headers = config.headers?.toJSON?.() ?? {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null || value === '') continue;
    parts.push(`-H ${quote(`${key}: ${String(value)}`)}`);
  }

  if (config.data !== undefined && config.data !== null) {
    const body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    parts.push(`--data-raw ${quote(body)}`);
  }

  return parts.join(' \\\n  ');
}

function buildUrl(config: InternalAxiosRequestConfig): string {
  const base = config.baseURL ?? '';
  const path = config.url ?? '';
  const full = /^https?:\/\//i.test(path) ? path : `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

  const params = config.params as Record<string, unknown> | undefined;
  if (!params) return full;

  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  if (!query) return full;
  return `${full}${full.includes('?') ? '&' : '?'}${query}`;
}

/** Single-quote for POSIX shells, escaping embedded single quotes. */
function quote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
