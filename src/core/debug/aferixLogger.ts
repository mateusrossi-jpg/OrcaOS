const isProd = (): boolean => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return Boolean(import.meta.env.PROD);
    }
  } catch {
    // Fallback if import.meta is restricted or undefined
  }
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
};

export const aferixLogger = {
  info: (prefix: string, message: string, ...data: unknown[]): void => {
    if (!isProd()) {
      console.info(`[${prefix}] ${message}`, ...data);
    }
  },
  warn: (prefix: string, message: string, ...data: unknown[]): void => {
    if (!isProd()) {
      console.warn(`[${prefix}] ${message}`, ...data);
    }
  },
  error: (prefix: string, message: string, ...data: unknown[]): void => {
    if (!isProd()) {
      console.error(`[${prefix}] ${message}`, ...data);
    }
  },
  audit: (prefix: string, message: string, ...data: unknown[]): void => {
    if (!isProd()) {
      console.log(`[${prefix} Audit] ${message}`, ...data);
    }
  }
};
