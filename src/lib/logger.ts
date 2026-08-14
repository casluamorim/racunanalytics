/**
 * Dev-only logger. In production builds nothing is written to the browser
 * console, so internal errors, routes and identifiers are not disclosed.
 */
export const logger = {
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.warn(...args);
  },
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.info(...args);
  },
};
