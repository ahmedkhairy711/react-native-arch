import { AxiosError, AxiosHeaders, CanceledError } from 'axios';
import { z } from 'zod';

import { ApiError } from './api-error';

const httpError = (status: number, data: unknown = {}) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('ApiError.from', () => {
  it.each([
    [400, 'badRequest'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'notFound'],
    [503, 'server'],
  ] as const)('maps HTTP %i to %s', (status, kind) => {
    expect(ApiError.from(httpError(status)).kind).toBe(kind);
  });

  it('keeps the server message', () => {
    expect(ApiError.from(httpError(400, { message: 'Invalid credentials' })).serverMessage).toBe(
      'Invalid credentials',
    );
  });

  it('maps missing response to network and timeouts to timeout', () => {
    expect(ApiError.from(new AxiosError('offline')).kind).toBe('network');
    expect(ApiError.from(new AxiosError('slow', 'ECONNABORTED')).kind).toBe('timeout');
  });

  it('maps cancellations and schema errors', () => {
    expect(ApiError.from(new CanceledError()).kind).toBe('cancelled');
    expect(ApiError.from(z.string().safeParse(1).error).kind).toBe('parsing');
  });
});
