export enum ProductStatus {
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
  NOT_FOUND = 'not_found'
}

export enum RiskLevel {
  SAFE = 'safe',
  UNSAFE = 'unsafe',
  UNKNOWN = 'unknown'
}

export interface Product {
  id: string
  name: string
  notificationNumber?: string
  status: ProductStatus
  riskLevel: RiskLevel
  cancellationReason?: string
  category?: string
  brand?: string
  createdAt: Date
  updatedAt: Date
}

export interface SearchQuery {
  query: string
  limit?: number
  offset?: number
}

export interface SearchResult {
  products: Product[]
  total: number
  alternatives?: Product[]
}