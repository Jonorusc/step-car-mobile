/**
 * Production-safe logger utility.
 *
 * In development (__DEV__ = true), logs are forwarded to the console as usual.
 * In production builds, all output is silently suppressed to prevent
 * information disclosure via ADB logcat / Xcode Console.
 */

const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
};

export default logger;
