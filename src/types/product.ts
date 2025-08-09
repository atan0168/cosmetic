export enum ProductStatus {
  NOTIFIED = 'Notified',
  CANCELLED = 'Cancelled'
}

export enum RiskLevel {
  SAFE = 'safe',
  UNSAFE = 'unsafe',
  UNKNOWN = 'unknown'
}

export interface Company {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  notifNo: string;
  category: string;
  status: ProductStatus;
  riskLevel: RiskLevel;
  reasonForCancellation?: string;
  dateNotified: string;
  applicantCompany?: Company;
  manufacturerCompany?: Company;
  isVerticallyIntegrated: boolean;
  recencyScore: number;
}

export interface CompanyMetrics {
  companyId: number;
  totalNotifs: number;
  firstNotifiedDate: string;
  cancelledCount: number;
  reputationScore: number;
}

export interface CategoryMetrics {
  productCategory: string;
  totalNotifs: number;
  cancelledCount: number;
  riskScore: number;
}

export interface RecommendedAlternative {
  id: number;
  cancelledProductId: number;
  recommendedProductId: number;
  brandScore: number;
  categoryRiskScore: number;
  isVerticallyIntegrated: boolean;
  recencyScore: number;
  relevanceScore: number;
}

export interface BannedIngredient {
  id: number;
  name: string;
  alternativeNames?: string;
  healthRiskDescription: string;
  regulatoryStatus?: string;
  sourceUrl?: string;
}

export interface CancelledProductIngredient {
  cancelledProductId: number;
  bannedIngredientId: number;
}

export interface BannedIngredientMetrics {
  ingredientId: number;
  occurrencesCount: number;
  firstAppearanceDate: string;
  lastAppearanceDate: string;
  riskScore: number;
}

export interface SearchQuery {
  query: string
  limit?: number
  offset?: number
}

export interface ProductSummary {
  id: number;
  notifNo: string;
  name: string;
  category: string;
  status: ProductStatus;
  reasonForCancellation: string | null;
  applicantCompany?: Company;
  manufacturerCompany?: Company;
}