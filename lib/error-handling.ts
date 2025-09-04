import { toast } from "sonner";

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  retryable?: boolean;
  action?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Standardize error messages based on error type and context
   */
  standardizeError(error: unknown, context: string): AppError {
    // Handle different error types
    if (error instanceof Error) {
      return this.handleErrorInstance(error, context);
    }
    
    if (typeof error === 'string') {
      return this.handleStringError(error, context);
    }
    
    if (typeof error === 'object' && error !== null) {
      return this.handleObjectError(error, context);
    }
    
    return {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      retryable: true,
      action: "Please try again"
    };
  }

  private handleErrorInstance(error: Error, context: string): AppError {
    const message = error.message;
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return {
        message: "Connection failed. Please check your internet connection.",
        code: "NETWORK_ERROR",
        status: 0,
        retryable: true,
        action: "Try again"
      };
    }
    
    // Authentication errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        message: "Your session has expired. Please log in again.",
        code: "AUTH_ERROR",
        status: 401,
        retryable: false,
        action: "Log in"
      };
    }
    
    // Permission errors
    if (message.includes('forbidden') || message.includes('403')) {
      return {
        message: "You don't have permission to perform this action.",
        code: "PERMISSION_ERROR",
        status: 403,
        retryable: false,
        action: "Contact support"
      };
    }
    
    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        message: "The requested resource was not found.",
        code: "NOT_FOUND",
        status: 404,
        retryable: false,
        action: "Go back"
      };
    }
    
    // Server errors
    if (message.includes('500') || message.includes('server error')) {
      return {
        message: "Server error occurred. Our team has been notified.",
        code: "SERVER_ERROR",
        status: 500,
        retryable: true,
        action: "Try again"
      };
    }
    
    // File upload errors
    if (context.includes('upload') || context.includes('file')) {
      if (message.includes('size') || message.includes('too large')) {
        return {
          message: "File is too large. Please choose a smaller file.",
          code: "FILE_TOO_LARGE",
          retryable: false,
          action: "Choose a smaller file"
        };
      }
      
      if (message.includes('type') || message.includes('format')) {
        return {
          message: "File type not supported. Please choose a different file.",
          code: "INVALID_FILE_TYPE",
          retryable: false,
          action: "Choose a different file"
        };
      }
      
      return {
        message: "Failed to upload file. Please try again.",
        code: "UPLOAD_ERROR",
        retryable: true,
        action: "Try again"
      };
    }
    
    // AI/API errors
    if (context.includes('ai') || context.includes('chat') || context.includes('api')) {
      return {
        message: "AI service temporarily unavailable. Please try again.",
        code: "AI_ERROR",
        retryable: true,
        action: "Try again"
      };
    }
    
    // Database errors
    if (context.includes('database') || context.includes('db')) {
      return {
        message: "Database error occurred. Please try again.",
        code: "DATABASE_ERROR",
        retryable: true,
        action: "Try again"
      };
    }
    
    // Default error handling
    return {
      message: message || "An error occurred",
      code: "GENERIC_ERROR",
      retryable: true,
      action: "Try again"
    };
  }

  private handleStringError(error: string, context: string): AppError {
    return {
      message: error,
      code: "STRING_ERROR",
      retryable: true,
      action: "Try again"
    };
  }

  private handleObjectError(error: Record<string, unknown>, context: string): AppError {
    // Handle Supabase errors
    if (error.code && error.message) {
      return {
        message: String(error.message),
        code: String(error.code),
        status: typeof error.status === 'number' ? error.status : undefined,
        retryable: this.isRetryableError(String(error.code)),
        action: this.getActionForError(String(error.code))
      };
    }
    
    // Handle fetch response errors
    if (error.status && error.statusText) {
      return {
        message: `Request failed: ${String(error.statusText)}`,
        code: `HTTP_${String(error.status)}`,
        status: typeof error.status === 'number' ? error.status : undefined,
        retryable: typeof error.status === 'number' ? error.status >= 500 : false,
        action: (typeof error.status === 'number' && error.status >= 500) ? "Try again" : "Check your input"
      };
    }
    
    return {
      message: "An unexpected error occurred",
      code: "UNKNOWN_OBJECT_ERROR",
      retryable: true,
      action: "Try again"
    };
  }

  private isRetryableError(code: string): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR',
      'DATABASE_ERROR',
      'AI_ERROR'
    ];
    
    return retryableCodes.includes(code) || code.startsWith('HTTP_5');
  }

  private getActionForError(code: string): string {
    const actionMap: Record<string, string> = {
      'AUTH_ERROR': 'Log in',
      'PERMISSION_ERROR': 'Contact support',
      'NOT_FOUND': 'Go back',
      'FILE_TOO_LARGE': 'Choose a smaller file',
      'INVALID_FILE_TYPE': 'Choose a different file',
      'NETWORK_ERROR': 'Check connection',
      'SERVER_ERROR': 'Try again',
      'AI_ERROR': 'Try again',
      'DATABASE_ERROR': 'Try again'
    };
    
    return actionMap[code] || 'Try again';
  }

  /**
   * Show error toast with standardized message
   */
  showError(error: unknown, context: string): AppError {
    const appError = this.standardizeError(error, context);
    
    toast.error(appError.message, {
      description: appError.action,
      action: appError.retryable ? {
        label: "Retry",
        onClick: () => {
          // This would be handled by the calling component
          console.log("Retry requested for:", context);
        }
      } : undefined
    });
    
    return appError;
  }

  /**
   * Log error for monitoring
   */
  logError(error: unknown, context: string, additionalInfo?: any): void {
    const appError = this.standardizeError(error, context);
    
    console.error(`[${context}] Error:`, {
      message: appError.message,
      code: appError.code,
      status: appError.status,
      retryable: appError.retryable,
      originalError: error,
      additionalInfo
    });
    
    // Here you would typically send to your error monitoring service
    // e.g., Sentry, LogRocket, etc.
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (error) {
    errorHandler.logError(error, context);
    errorHandler.showError(error, context);
    return fallback;
  }
};

export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.logError(error, context);
      errorHandler.showError(error, context);
      return undefined;
    }
  };
};
