import { z } from 'zod';
import { ProductStatus, RiskLevel } from '@/types/product';
import { sanitizeInput, customRefinements } from '@/lib/utils/validation';

// Company validation schema
export const CompanySchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(255, 'Company name too long')
    .transform(sanitizeInput.string)
    .refine(customRefinements.companyName, 'Invalid company name format'),
});

// Product validation schema with enhanced validation
export const ProductSchema = z.object({
  id: z.number().int().positive(),
  notifNo: z
    .string()
    .min(1, 'Notification number is required')
    .max(255, 'Notification number too long')
    .transform(sanitizeInput.notificationNumber)
    .refine(customRefinements.notificationNumber, 'Invalid notification number format'),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name too long')
    .transform(sanitizeInput.string)
    .refine(customRefinements.productName, 'Invalid product name format'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(255, 'Category name too long')
    .transform(sanitizeInput.string),
  status: z.nativeEnum(ProductStatus, {
    message: "Status must be either 'Approved' or 'Cancelled'",
  }),
  riskLevel: z.nativeEnum(RiskLevel, {
    message: "Risk level must be 'safe', 'unsafe', or 'unknown'",
  }),
  reasonForCancellation: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeInput.string(val) : val)),
  dateNotified: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(customRefinements.pastDate, 'Date cannot be in the future'),
  applicantCompany: CompanySchema.optional(),
  manufacturerCompany: CompanySchema.optional(),
  isVerticallyIntegrated: z.boolean(),
  recencyScore: z.number().min(0).max(1),
});

// Company metrics validation schema
export const CompanyMetricsSchema = z.object({
  companyId: z.number().int().positive(),
  totalNotifs: z.number().int().min(0),
  firstNotifiedDate: z.string(),
  cancelledCount: z.number().int().min(0),
  reputationScore: z.number().min(0).max(1),
});

// Category metrics validation schema
export const CategoryMetricsSchema = z.object({
  productCategory: z.string().min(1).max(255),
  totalNotifs: z.number().int().min(0),
  cancelledCount: z.number().int().min(0),
  riskScore: z.number().min(0).max(1),
});

// Recommended alternative validation schema
export const RecommendedAlternativeSchema = z.object({
  id: z.number().int().positive(),
  cancelledProductId: z.number().int().positive(),
  recommendedProductId: z.number().int().positive(),
  brandScore: z.number().min(0).max(1),
  categoryRiskScore: z.number().min(0).max(1),
  isVerticallyIntegrated: z.boolean(),
  recencyScore: z.number().min(0).max(1),
  relevanceScore: z.number().min(0).max(1),
});

// Banned ingredient validation schema with enhanced validation
export const BannedIngredientSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, 'Ingredient name is required')
    .max(255, 'Ingredient name too long')
    .transform(sanitizeInput.string),
  alternativeNames: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeInput.string(val) : val)),
  healthRiskDescription: z
    .string()
    .min(1, 'Health risk description is required')
    .transform(sanitizeInput.string),
  regulatoryStatus: z
    .string()
    .max(100, 'Regulatory status too long')
    .optional()
    .transform((val) => (val ? sanitizeInput.string(val) : val)),
  sourceUrl: z.string().url('Invalid URL format').max(500, 'URL too long').optional(),
});

// Cancelled product ingredient validation schema
export const CancelledProductIngredientSchema = z.object({
  cancelledProductId: z.number().int().positive(),
  bannedIngredientId: z.number().int().positive(),
});

// Banned ingredient metrics validation schema
export const BannedIngredientMetricsSchema = z.object({
  ingredientId: z.number().int().positive(),
  occurrencesCount: z.number().int().min(0),
  firstAppearanceDate: z.string(),
  lastAppearanceDate: z.string(),
  riskScore: z.number().min(0).max(1),
});

// Enhanced search query validation schema with sanitization
export const SearchQuerySchema = z.object({
  query: z
    .string()
    .min(3, 'Please enter at least 3 characters')
    .max(100, 'Search query too long')
    .transform(sanitizeInput.searchQuery)
    .refine(customRefinements.meaningfulSearch, 'Search query must contain meaningful content'),
  limit: z.number().int().min(1).max(50).default(10),
  offset: z.number().int().min(0).default(0),
  status: z.nativeEnum(ProductStatus).optional(),
});

// Search response validation schema
export const SearchResponseSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number().min(0),
  alternatives: z.array(ProductSchema).optional(),
  error: z.string().optional(),
});

// Enhanced API response validation schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Error response schema for consistent error handling
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

// Alternative products request schema
export const AlternativesRequestSchema = z.object({
  excludeId: z.number().int().positive().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(10).default(3),
});

// Re-export validation utilities for convenience
export { validationUtils, sanitizeInput, customRefinements } from '@/lib/utils/validation';

// Additional validation schemas for API endpoints
export const ProductIdSchema = z.object({
  id: z.number().int().positive(),
});

export const NotificationNumberSchema = z.object({
  notifNo: z.string().min(1).max(255).transform(sanitizeInput.notificationNumber),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).optional(),
});

// Type exports for use in components
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type AlternativesRequest = z.infer<typeof AlternativesRequestSchema>;
export type CompanyMetrics = z.infer<typeof CompanyMetricsSchema>;
export type CategoryMetrics = z.infer<typeof CategoryMetricsSchema>;
export type RecommendedAlternative = z.infer<typeof RecommendedAlternativeSchema>;
export type BannedIngredient = z.infer<typeof BannedIngredientSchema>;
export type CancelledProductIngredient = z.infer<typeof CancelledProductIngredientSchema>;
export type BannedIngredientMetrics = z.infer<typeof BannedIngredientMetricsSchema>;
export type ProductId = z.infer<typeof ProductIdSchema>;
export type NotificationNumber = z.infer<typeof NotificationNumberSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
