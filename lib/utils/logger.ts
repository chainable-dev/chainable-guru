export class Logger {
  static error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
    // You can also send to error tracking service here
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data);
  }

  static info(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data);
  }

  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
} 