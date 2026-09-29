/**
 * Single logging entry point. Never call console.* directly in app code.
 *
 * - debug/info/warn print only in __DEV__ (and console.* is stripped from release bundles by Babel).
 * - error is forwarded to the crash reporter in every build (plug Sentry/Crashlytics in `setErrorReporter`).
 */
type ErrorReporter = (error: unknown, context?: Record<string, unknown>) => void;

let reportError: ErrorReporter = () => {};

export const logger = {
  debug(message: string, ...args: unknown[]) {
    if (__DEV__) console.debug(`🐛 ${message}`, ...args);
  },
  info(message: string, ...args: unknown[]) {
    if (__DEV__) console.info(`💡 ${message}`, ...args);
  },
  warn(message: string, ...args: unknown[]) {
    if (__DEV__) console.warn(`⚠️ ${message}`, ...args);
  },
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (__DEV__) console.error(`⛔ ${message}`, error ?? '', context ?? '');
    reportError(error ?? new Error(message), { message, ...context });
  },
};

export function setErrorReporter(reporter: ErrorReporter) {
  reportError = reporter;
}
