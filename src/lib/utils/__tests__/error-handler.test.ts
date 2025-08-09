import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  categorizeError,
  getRetryStrategy,
  logError,
  getUserFriendlyMessage,
  useErrorHandler,
  ErrorType,
} from '../error-handler';

describe('error-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('categorizeError', () => {
    it('should categorize validation errors correctly', () => {
      const validationErrors = [
        'Please enter at least 3 characters',
        'Invalid input provided',
        'Validation failed',
        'Search query too long',
      ];

      validationErrors.forEach((errorMessage) => {
        const result = categorizeError(errorMessage);
        expect(result.type).toBe(ErrorType.VALIDATION);
        expect(result.retryable).toBe(false);
        expect(result.message).toBe(errorMessage);
      });
    });

    it('should categorize network errors correctly', () => {
      const networkErrors = [
        'fetch failed',
        'network error occurred',
        'connection refused',
        'NetworkError: Failed to fetch',
      ];

      networkErrors.forEach((errorMessage) => {
        const result = categorizeError(errorMessage);
        expect(result.type).toBe(ErrorType.NETWORK);
        expect(result.retryable).toBe(true);
        expect(result.message).toBe('Network connection error. Please check your internet connection.');
      });
    });

    it('should categorize database errors correctly', () => {
      const databaseErrors = [
        'database connection failed',
        'query timeout',
        'connection error',
        'database query failed',
      ];

      databaseErrors.forEach((errorMessage) => {
        const result = categorizeError(errorMessage);
        expect(result.type).toBe(ErrorType.DATABASE);
        expect(result.retryable).toBe(true);
        expect(result.message).toBe('Database connection error. Please try again later.');
      });
    });

    it('should categorize rate limit errors correctly', () => {
      const rateLimitErrors = [
        'rate limit exceeded',
        'too many requests',
        'Error 429',
      ];

      rateLimitErrors.forEach((errorMessage) => {
        const result = categorizeError(errorMessage);
        expect(result.type).toBe(ErrorType.RATE_LIMIT);
        expect(result.retryable).toBe(true);
        expect(result.message).toBe('Too many requests. Please wait a moment before trying again.');
      });
    });

    it('should categorize timeout errors correctly', () => {
      const timeoutErrors = [
        'request timeout',
        'took too long to complete',
        'Error 408',
      ];

      timeoutErrors.forEach((errorMessage) => {
        const result = categorizeError(errorMessage);
        expect(result.type).toBe(ErrorType.TIMEOUT);
        expect(result.retryable).toBe(true);
        expect(result.message).toBe('Request timeout. Please try again.');
      });
    });

    it('should categorize server errors correctly', () => {
      const serverErrors = [
        'server error occurred',
        'Error 500',
        'Error 503',
        'Error 502',
      ];

      serverErrors.forEach((errorMessage) => {
        const result = categorizeError(errorMessage);
        expect(result.type).toBe(ErrorType.SERVER);
        expect(result.retryable).toBe(true);
        expect(result.message).toBe('Server error. Please try again later.');
      });
    });

    it('should categorize unknown errors correctly', () => {
      const unknownErrors = [
        'Something weird happened',
        'Unexpected error',
        '',
      ];

      unknownErrors.forEach((errorMessage) => {
        const result = categorizeError(errorMessage);
        expect(result.type).toBe(ErrorType.UNKNOWN);
        expect(result.retryable).toBe(true);
        expect(result.message).toBe('An unexpected error occurred. Please try again.');
      });
    });

    it('should handle Error objects correctly', () => {
      const error = new Error('network connection failed');
      const result = categorizeError(error);
      
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.originalError).toBe(error);
      expect(result.retryable).toBe(true);
    });
  });

  describe('getRetryStrategy', () => {
    it('should return correct retry strategy for validation errors', () => {
      const strategy = getRetryStrategy(ErrorType.VALIDATION);
      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.maxRetries).toBe(0);
      expect(strategy.delayMs).toBe(0);
    });

    it('should return correct retry strategy for network errors', () => {
      const strategy = getRetryStrategy(ErrorType.NETWORK);
      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.maxRetries).toBe(3);
      expect(strategy.delayMs).toBe(1000);
    });

    it('should return correct retry strategy for timeout errors', () => {
      const strategy = getRetryStrategy(ErrorType.TIMEOUT);
      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.maxRetries).toBe(3);
      expect(strategy.delayMs).toBe(1000);
    });

    it('should return correct retry strategy for database errors', () => {
      const strategy = getRetryStrategy(ErrorType.DATABASE);
      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.maxRetries).toBe(2);
      expect(strategy.delayMs).toBe(2000);
    });

    it('should return correct retry strategy for server errors', () => {
      const strategy = getRetryStrategy(ErrorType.SERVER);
      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.maxRetries).toBe(2);
      expect(strategy.delayMs).toBe(2000);
    });

    it('should return correct retry strategy for rate limit errors', () => {
      const strategy = getRetryStrategy(ErrorType.RATE_LIMIT);
      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.maxRetries).toBe(1);
      expect(strategy.delayMs).toBe(5000);
    });

    it('should return correct retry strategy for unknown errors', () => {
      const strategy = getRetryStrategy(ErrorType.UNKNOWN);
      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.maxRetries).toBe(1);
      expect(strategy.delayMs).toBe(1000);
    });
  });

  describe('logError', () => {
    it('should log errors in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const appError = categorizeError('test error');
      const context = { userId: '123', action: 'search' };

      logError(appError, context);

      expect(console.error).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          type: appError.type,
          message: appError.message,
          retryable: appError.retryable,
          context,
          timestamp: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should log errors in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const appError = categorizeError('test error');
      logError(appError);

      expect(console.warn).toHaveBeenCalledWith(
        'Error logged to monitoring service:',
        expect.objectContaining({
          type: appError.type,
          message: appError.message,
          retryable: appError.retryable,
          timestamp: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return appropriate user-friendly messages for each error type', () => {
      const testCases = [
        {
          type: ErrorType.VALIDATION,
          expected: 'Please enter at least 3 characters',
          input: 'Please enter at least 3 characters',
        },
        {
          type: ErrorType.NETWORK,
          expected: 'Please check your internet connection and try again.',
        },
        {
          type: ErrorType.DATABASE,
          expected: 'We\'re having trouble accessing our database. Please try again in a moment.',
        },
        {
          type: ErrorType.RATE_LIMIT,
          expected: 'You\'re searching too quickly. Please wait a moment before trying again.',
        },
        {
          type: ErrorType.TIMEOUT,
          expected: 'The request is taking longer than expected. Please try again.',
        },
        {
          type: ErrorType.SERVER,
          expected: 'Our servers are experiencing issues. Please try again later.',
        },
        {
          type: ErrorType.UNKNOWN,
          expected: 'Something unexpected happened. Please try again.',
        },
      ];

      testCases.forEach(({ type, expected, input }) => {
        const appError = {
          type,
          message: input || 'test message',
          retryable: true,
        };
        
        const result = getUserFriendlyMessage(appError);
        expect(result).toBe(expected);
      });
    });
  });

  describe('useErrorHandler', () => {
    it('should provide error handling utilities', () => {
      const { handleError, getErrorMessage, shouldRetry, categorizeError: categorize } = useErrorHandler();

      expect(typeof handleError).toBe('function');
      expect(typeof getErrorMessage).toBe('function');
      expect(typeof shouldRetry).toBe('function');
      expect(typeof categorize).toBe('function');
    });

    it('should handle errors correctly', () => {
      const { handleError } = useErrorHandler();
      const error = new Error('network connection failed');
      const context = { action: 'search' };

      const result = handleError(error, context);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.originalError).toBe(error);
      expect(result.retryable).toBe(true);
    });

    it('should get user-friendly error messages', () => {
      const { getErrorMessage } = useErrorHandler();
      const error = 'network connection failed';

      const message = getErrorMessage(error);

      expect(message).toBe('Please check your internet connection and try again.');
    });

    it('should determine if errors are retryable', () => {
      const { shouldRetry } = useErrorHandler();

      expect(shouldRetry('network error')).toBe(true);
      expect(shouldRetry('validation failed')).toBe(false);
      expect(shouldRetry('server error')).toBe(true);
    });
  });
});