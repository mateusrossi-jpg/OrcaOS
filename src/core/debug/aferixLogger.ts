export const aferixLogger = {
  info: (prefix: string, message: string, ...data: unknown[]) => {
    if (!import.meta.env.PROD) {
      console.info(`[${prefix}] ${message}`, ...data);
    }
  },
  warn: (prefix: string, message: string, ...data: unknown[]) => {
    if (!import.meta.env.PROD) {
      console.warn(`[${prefix}] ${message}`, ...data);
    }
  },
  error: (prefix: string, message: string, ...data: unknown[]) => {
    if (!import.meta.env.PROD) {
      console.error(`[${prefix}] ${message}`, ...data);
    }
  },
  audit: (prefix: string, message: string, ...data: unknown[]) => {
    if (!import.meta.env.PROD) {
      console.log(`[${prefix} Audit] ${message}`, ...data);
    }
  }
};
