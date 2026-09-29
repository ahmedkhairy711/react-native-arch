import { isAxiosError, isCancel } from 'axios';
import { ZodError } from 'zod';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'badRequest'
  | 'server'
  | 'parsing'
  | 'unknown';

/**
 * The only error type that leaves the data layer.
 * ViewModels switch on `kind` and show `errors.<kind>` from i18n (see ErrorView).
 */
export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
    /** Server-provided message, when it is safe to show. */
    readonly serverMessage?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (isCancel(error)) return new ApiError('cancelled', 'Request cancelled');
    if (error instanceof ZodError) return new ApiError('parsing', error.message);

    if (isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new ApiError('timeout', error.message);
      }
      if (!error.response) return new ApiError('network', error.message);

      const { status, data } = error.response;
      const serverMessage =
        typeof data === 'object' && data && 'message' in data && typeof data.message === 'string'
          ? data.message
          : undefined;

      return new ApiError(kindFromStatus(status), error.message, status, serverMessage);
    }

    return new ApiError('unknown', error instanceof Error ? error.message : String(error));
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'badRequest';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status >= 500) return 'server';
  return 'unknown';
}
