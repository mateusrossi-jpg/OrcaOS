export const aferixLogger = {
  info: (prefix: string, message: string, ...data: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[${prefix}] ${message}`, ...data);
    }
  },
  warn: (prefix: string, message: string, ...data: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[${prefix}] ${message}`, ...data);
    }
  },
  error: (prefix: string, message: string, ...data: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${prefix}] ${message}`, ...data);
    }
  },
  audit: (prefix: string, message: string, ...data: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${prefix} Audit] ${message}`, ...data);
    }
  }
};
