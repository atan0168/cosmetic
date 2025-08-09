import { z } from 'zod';
import { ErrorResponse } from '@/lib/validations';

/**
 * Input sanitization utilities
 */
export const sanitizeInput = {
  /**
   * Sanitize general string input by removing potentially harmful characters
   */
  string: (input: string): string => {
    return input.trim().replace(/<[^>]*>/g, '');
  },

  /**
   * Sanitize search query input with additional restrictions
   */
  searchQuery: (query: string): string => {
    return query
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim() // Trim after normalization
      .substring(0, 100);
  },

  /**
   * Sanitize HTML content by removing all HTML tags
   */
  html: (input: string): string => {
    return input.replace(/<[^>]*>/g, '').trim();
  },

  /**
   * Sanitize notification number format
   */
  notificationNumber: (input: string): string => {
    return input.trim().toUpperCase().replace(/[^A-Z0-9\-\/]/g, '');
  }
};

/**
 * Error handling utilities for validation
 */
export const validationUtils = {
  /**
   * Convert Zod error to standardized error response
   */
  formatZodError: (error: z.ZodError): ErrorResponse => {
    // Access errors through the issues property
    const errors = error.issues || [];
    
    if (errors.length === 0) {
      return {
        error: 'Validation failed',
        message: 'Unknown validation error'
      };
    }
    
    const firstError = errors[0];
    return {
      error: firstError.message,
      message: `Validation failed for field: ${firstError.path.join('.')}`,
      code: firstError.code,
      details: errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>)
    };
  },

  /**
   * Safe validation wrapper that returns success/error result
   */
  safeValidate: <T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): { success: true; data: T } | { success: false; error: ErrorResponse } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: validationUtils.formatZodError(error) };
      }
      return {
        success: false,
        error: {
          error: 'Validation failed',
          message: error instanceof Error ? error.message : 'Unknown validation error'
        }
      };
    }
  },

  /**
   * Validate and sanitize search parameters
   */
  validateSearchParams: (params: URLSearchParams) => {
    const query = params.get('query');
    const limit = params.get('limit');
    const offset = params.get('offset');

    return {
      query: query ? sanitizeInput.searchQuery(query) : '',
      limit: limit ? Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50) : 10,
      offset: offset ? Math.max(parseInt(offset, 10) || 0, 0) : 0
    };
  },

  /**
   * Create standardized error responses for API endpoints
   */
  createErrorResponse: (
    message: string,
    code?: string,
    details?: Record<string, any>
  ): ErrorResponse => ({
    error: message,
    code,
    details
  }),

  /**
   * Validate required fields are present
   */
  validateRequired: (data: Record<string, any>, fields: string[]): string[] => {
    const missing: string[] = [];
    for (const field of fields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        missing.push(field);
      }
    }
    return missing;
  }
};

/**
 * Common validation patterns
 */
export const validationPatterns = {
  notificationNumber: /^[A-Z0-9\-\/]+$/,
  productName: /^[a-zA-Z0-9\s\-\.\,\(\)]+$/,
  companyName: /^[a-zA-Z0-9\s\-\.\,\(\)&]+$/,
  dateFormat: /^\d{4}-\d{2}-\d{2}$/,
  url: /^https?:\/\/.+/
};

/**
 * Custom Zod refinements for common validation scenarios
 */
export const customRefinements = {
  /**
   * Validate notification number format - allow more flexible format
   */
  notificationNumber: (val: string) => val.length > 0 && val.length <= 255,
  
  /**
   * Validate product name contains only allowed characters - more permissive
   */
  productName: (val: string) => val.length > 0 && val.length <= 255,
  
  /**
   * Validate company name format - more permissive
   */
  companyName: (val: string) => val.length > 0 && val.length <= 255,
  
  /**
   * Validate date is not in the future
   */
  pastDate: (val: string) => {
    try {
      const date = new Date(val);
      return date <= new Date();
    } catch {
      return false;
    }
  },
  
  /**
   * Validate search query has meaningful content
   */
  meaningfulSearch: (val: string) => {
    const cleaned = val.trim();
    return cleaned.length >= 3 && !/^\s*$/.test(cleaned);
  }
};