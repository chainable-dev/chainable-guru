type ErrorContext = Record<string, unknown>;

class ErrorLogger {
  private static instance: ErrorLogger;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  init() {
    if (this.isInitialized) return;

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError(error || new Error(message as string), {
        source,
        lineno,
        colno,
        type: 'window.onerror'
      });
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      this.logError(event.reason, {
        type: 'unhandledrejection',
        promise: event.promise
      });
    };

    this.isInitialized = true;
  }

  logError(error: Error, context: ErrorContext = {}) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
      console.error('Context:', context);
      return;
    }

    // In production, you might want to send to an error tracking service
    // For now, we'll just log to console
    console.error('[Production Error]:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    });
  }
}

export const errorLogger = ErrorLogger.getInstance(); 