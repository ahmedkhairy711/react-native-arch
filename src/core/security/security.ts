import JailMonkey from 'jail-monkey';
import {
  addSslPinningErrorListener,
  initializeSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';

import type { Env } from '../config/env';
import { logger } from '../logger/logger';

/**
 * SSL public-key pinning: blocks MITM proxies (Charles, mitmproxy, rogue CAs).
 * Applies to fetch/axios. Enabled only when pins are configured for the flavor (app.config.ts).
 */
export async function setupSslPinning(env: Env): Promise<void> {
  const domains = Object.entries(env.sslPins).filter(([, pins]) => pins.length > 0);
  if (domains.length === 0 || !isSslPinningAvailable()) return;

  await initializeSslPinning(
    Object.fromEntries(
      domains.map(([domain, publicKeyHashes]) => [domain, { includeSubdomains: true, publicKeyHashes }]),
    ),
  );
  addSslPinningErrorListener((error) => {
    logger.error('SSL pinning failure', new Error(error.message), { host: error.serverHostname });
  });
}

/**
 * Root / jailbreak / hooking-framework (Frida, Substrate) detection.
 * Heuristic by nature - raise the bar, don't rely on it alone. Keep secrets on the server.
 */
export function isDeviceCompromised(): boolean {
  if (__DEV__) return false; // simulators & debug builds would always trip it
  try {
    return JailMonkey.isJailBroken() || JailMonkey.hookDetected();
  } catch (error) {
    logger.error('Integrity check failed', error);
    return false;
  }
}
