type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  module?: string;
  data?: any;
}

export class Logger {
  private static readonly DEBUG = process.env.NODE_ENV === 'development';

  static log(message: string, options: LogOptions = {}) {
    const {
      level = 'info',
      module = 'App',
      data
    } = options;

    if (!this.DEBUG && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${module}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
      case 'info':
        console.log(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }
  }

  static debug(message: string, module?: string, data?: any) {
    this.log(message, { level: 'debug', module, data });
  }

  static info(message: string, module?: string, data?: any) {
    this.log(message, { level: 'info', module, data });
  }

  static warn(message: string, module?: string, data?: any) {
    this.log(message, { level: 'warn', module, data });
  }

  static error(message: string, module?: string, data?: any) {
    this.log(message, { level: 'error', module, data });
  }

  static startOperation(operation: string, module: string) {
    this.debug(`Starting ${operation}`, module);
    const startTime = performance.now();
    return {
      end: () => {
        const duration = Math.round(performance.now() - startTime);
        this.debug(`Completed ${operation} in ${duration}ms`, module);
      }
    };
  }
} 