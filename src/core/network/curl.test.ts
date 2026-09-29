import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

import { toCurl } from './curl';

const config = (overrides: Partial<InternalAxiosRequestConfig>): InternalAxiosRequestConfig => ({
  headers: new AxiosHeaders(),
  ...overrides,
});

describe('toCurl', () => {
  it('builds a GET with base url, query params and headers', () => {
    const curl = toCurl(
      config({
        method: 'get',
        baseURL: 'https://api.test/',
        url: '/products',
        params: { limit: 20, q: 'a b', skip: undefined },
        headers: new AxiosHeaders({ Authorization: 'Bearer x' }),
      }),
    );

    expect(curl).toContain(`curl -X GET 'https://api.test/products?limit=20&q=a%20b'`);
    expect(curl).toContain(`-H 'Authorization: Bearer x'`);
    expect(curl).not.toContain('skip');
  });

  it('adds a JSON body and escapes single quotes', () => {
    const curl = toCurl(config({ method: 'post', url: 'https://api.test/login', data: { name: "O'Neil" } }));

    expect(curl).toContain(`curl -X POST 'https://api.test/login'`);
    expect(curl).toContain(`--data-raw '{"name":"O'\\''Neil"}'`);
  });
});
