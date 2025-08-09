import { z } from "zod";

// Company validation schema
export const CompanySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
});

// Product validation schema
export const ProductSchema = z.object({
  id: z.number().int().positive(),
  notifNo: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(255),
  status: z.enum(["Notified", "Cancelled"]),
  riskLevel: z.enum(["safe", "unsafe", "unknown"]),
  reasonForCancellation: z.string().optional(),
  dateNotified: z.string(),
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

// Banned ingredient validation schema
export const BannedIngredientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  alternativeNames: z.string().optional(),
  healthRiskDescription: z.string().min(1),
  regulatoryStatus: z.string().max(100).optional(),
  sourceUrl: z.string().url({ message: "Invalid URL format" }).max(500).optional(),
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

// Search query validation schema
export const SearchQuerySchema = z.object({
  query: z.string().min(3, "Please enter at least 3 characters").max(100),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
});

// Search response validation schema
export const SearchResponseSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number().min(0),
  alternatives: z.array(ProductSchema).optional(),
});

// API response validation schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Alternative products request schema
export const AlternativesRequestSchema = z.object({
  excludeId: z.number().int().positive().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(10).default(3),
});

// Type exports for use in components
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type AlternativesRequest = z.infer<typeof AlternativesRequestSchema>;
export type CompanyMetrics = z.infer<typeof CompanyMetricsSchema>;
export type CategoryMetrics = z.infer<typeof CategoryMetricsSchema>;
export type RecommendedAlternative = z.infer<
  typeof RecommendedAlternativeSchema
>;
export type BannedIngredient = z.infer<typeof BannedIngredientSchema>;
export type CancelledProductIngredient = z.infer<
  typeof CancelledProductIngredientSchema
>;
export type BannedIngredientMetrics = z.infer<
  typeof BannedIngredientMetricsSchema
>;
