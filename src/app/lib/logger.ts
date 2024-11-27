export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (message: string, error: any) => {
    console.error(`[ERROR] ${message}:`, error);
    console.error('Stack trace:', error.stack);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
    }
  }
}; 