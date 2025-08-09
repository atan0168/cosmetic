import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validationUtils, ErrorResponse } from '@/lib/validations';

/**
 * API helper utilities for consistent request/response handling
 */

/**
 * Validate request body with a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: ErrorResponse }> {
  try {
    const body = await request.json();
    return validationUtils.safeValidate(schema, body);
  } catch {
    return {
      success: false,
      error: {
        error: 'Invalid JSON in request body',
        message: 'Request body must be valid JSON'
      }
    };
  }
}

/**
 * Validate URL search parameters with a Zod schema
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: ErrorResponse } {
  const params = Object.fromEntries(searchParams.entries());
  return validationUtils.safeValidate(schema, params);
}

/**
 * Create standardized error responses
 */
export function createErrorResponse(
  error: ErrorResponse,
  status: number = 400
): NextResponse {
  return NextResponse.json(error, { status });
}

/**
 * Create standardized success responses
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data
  }, { status });
}

/**
 * Handle validation errors consistently
 */
export function handleValidationError(
  validationResult: { success: false; error: ErrorResponse }
): NextResponse {
  return createErrorResponse(validationResult.error, 400);
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withValidation<T, R>(
  schema: z.ZodSchema<T>,
  handler: (validatedData: T, request: NextRequest) => Promise<NextResponse<R>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let validationResult;
      
      if (request.method === 'GET') {
        const { searchParams } = new URL(request.url);
        validationResult = validateSearchParams(searchParams, schema);
      } else {
        validationResult = await validateRequestBody(request, schema);
      }
      
      if (!validationResult.success) {
        return handleValidationError(validationResult);
      }
      
      return await handler(validationResult.data, request);
    } catch (error) {
      console.error('API route error:', error);
      return createErrorResponse({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }, 500);
    }
  };
}

/**
 * Rate limiting helper (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Get client IP address for rate limiting
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}