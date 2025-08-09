/**
 * Centralized error handling utilities for the application
 */

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  code?: string | number;
  retryable: boolean;
}

/**
 * Categorizes an error based on its characteristics
 */
export function categorizeError(error: Error | string): AppError {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const originalError = typeof error === 'string' ? undefined : error;

  // Validation errors (check first, most specific)
  if (
    errorMessage.includes('Validation failed') ||
    errorMessage.includes('Invalid input provided') ||
    errorMessage.includes('Please enter at least 3 characters') ||
    errorMessage.includes('Search query too long') ||
    errorMessage.includes('validation failed')
  ) {
    return {
      type: ErrorType.VALIDATION,
      message: errorMessage,
      originalError,
      retryable: false,
    };
  }

  // Rate limit errors (check early to avoid confusion with other errors)
  if (
    errorMessage.includes('rate limit exceeded') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('Error 429')
  ) {
    return {
      type: ErrorType.RATE_LIMIT,
      message: 'Too many requests. Please wait a moment before trying again.',
      originalError,
      retryable: true,
    };
  }

  // Timeout errors (check before database/network to be specific)
  if (
    errorMessage.includes('request timeout') ||
    errorMessage.includes('took too long to complete') ||
    errorMessage.includes('Error 408')
  ) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'Request timeout. Please try again.',
      originalError,
      retryable: true,
    };
  }

  // Database errors (check before network errors for specificity)
  if (
    errorMessage.includes('database connection failed') ||
    errorMessage.includes('database query failed') ||
    (errorMessage.includes('query') && errorMessage.includes('timeout')) ||
    (errorMessage.includes('connection error') && !errorMessage.includes('network'))
  ) {
    return {
      type: ErrorType.DATABASE,
      message: 'Database connection error. Please try again later.',
      originalError,
      retryable: true,
    };
  }

  // Network errors (check after more specific database errors)
  if (
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network error occurred') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('NetworkError: Failed to fetch') ||
    errorMessage.includes('network connection failed') ||
    errorMessage.includes('network error')
  ) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network connection error. Please check your internet connection.',
      originalError,
      retryable: true,
    };
  }

  // Server errors
  if (
    errorMessage.includes('server error occurred') ||
    errorMessage.includes('Error 500') ||
    errorMessage.includes('Error 503') ||
    errorMessage.includes('Error 502') ||
    errorMessage.includes('server error')
  ) {
    return {
      type: ErrorType.SERVER,
      message: 'Server error. Please try again later.',
      originalError,
      retryable: true,
    };
  }

  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    originalError,
    retryable: true,
  };
}

/**
 * Determines retry strategy based on error type
 */
export function getRetryStrategy(errorType: ErrorType): {
  shouldRetry: boolean;
  maxRetries: number;
  delayMs: number;
} {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return { shouldRetry: false, maxRetries: 0, delayMs: 0 };
    
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
      return { shouldRetry: true, maxRetries: 3, delayMs: 1000 };
    
    case ErrorType.DATABASE:
    case ErrorType.SERVER:
      return { shouldRetry: true, maxRetries: 2, delayMs: 2000 };
    
    case ErrorType.RATE_LIMIT:
      return { shouldRetry: true, maxRetries: 1, delayMs: 5000 };
    
    case ErrorType.UNKNOWN:
    default:
      return { shouldRetry: true, maxRetries: 1, delayMs: 1000 };
  }
}

/**
 * Logs errors with appropriate level and context
 */
export function logError(appError: AppError, context?: Record<string, unknown>) {
  const logData = {
    type: appError.type,
    message: appError.message,
    retryable: appError.retryable,
    context,
    timestamp: new Date().toISOString(),
    stack: appError.originalError?.stack,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', logData);
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // monitoringService.captureException(logData);
    console.warn('Error logged to monitoring service:', logData);
  }
}

/**
 * Creates user-friendly error messages based on error type
 */
export function getUserFriendlyMessage(appError: AppError): string {
  switch (appError.type) {
    case ErrorType.VALIDATION:
      return appError.message; // Validation messages are already user-friendly
    
    case ErrorType.NETWORK:
      return 'Please check your internet connection and try again.';
    
    case ErrorType.DATABASE:
      return 'We\'re having trouble accessing our database. Please try again in a moment.';
    
    case ErrorType.RATE_LIMIT:
      return 'You\'re searching too quickly. Please wait a moment before trying again.';
    
    case ErrorType.TIMEOUT:
      return 'The request is taking longer than expected. Please try again.';
    
    case ErrorType.SERVER:
      return 'Our servers are experiencing issues. Please try again later.';
    
    case ErrorType.UNKNOWN:
    default:
      return 'Something unexpected happened. Please try again.';
  }
}

/**
 * Hook for handling errors in React components
 */
export function useErrorHandler() {
  const handleError = (error: Error | string, context?: Record<string, unknown>) => {
    const appError = categorizeError(error);
    logError(appError, context);
    return appError;
  };

  const getErrorMessage = (error: Error | string): string => {
    const appError = categorizeError(error);
    return getUserFriendlyMessage(appError);
  };

  const shouldRetry = (error: Error | string): boolean => {
    const appError = categorizeError(error);
    return appError.retryable;
  };

  return {
    handleError,
    getErrorMessage,
    shouldRetry,
    categorizeError,
  };
}