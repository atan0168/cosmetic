import { ProductStatus, RiskLevel } from '@/types/product';

/**
 * Calculate risk level based on product status
 */
export function calculateRiskLevel(status: ProductStatus): RiskLevel {
  switch (status) {
    case ProductStatus.APPROVED:
      return RiskLevel.SAFE;
    case ProductStatus.CANCELLED:
      return RiskLevel.UNSAFE;
    default:
      return RiskLevel.UNKNOWN;
  }
}

/**
 * Get risk indicator color class for UI
 */
export function getRiskColorClass(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case RiskLevel.SAFE:
      return 'bg-green-100 text-green-800 border-green-200';
    case RiskLevel.UNSAFE:
      return 'bg-red-100 text-red-800 border-red-200';
    case RiskLevel.UNKNOWN:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get risk indicator text for display
 */
export function getRiskText(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case RiskLevel.SAFE:
      return 'SAFE';
    case RiskLevel.UNSAFE:
      return 'UNSAFE';
    case RiskLevel.UNKNOWN:
      return 'UNKNOWN';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Format cancellation reason for user-friendly display
 */
export function formatCancellationReason(reason?: string): string {
  if (!reason) {
    return 'Reason not specified';
  }

  // Basic formatting - capitalize first letter and ensure proper punctuation
  const formatted = reason.charAt(0).toUpperCase() + reason.slice(1);
  return formatted.endsWith('.') ? formatted : formatted + '.';
}

/**
 * Sanitize search query input
 */
export function sanitizeSearchQuery(query: string): string {
  return query.trim().replace(/[<>]/g, '');
}

/**
 * Transform raw product data to include computed risk level
 */
export function transformProductData(
  rawProduct: Record<string, unknown> & { status: ProductStatus },
): Record<string, unknown> {
  return {
    ...rawProduct,
    riskLevel: calculateRiskLevel(rawProduct.status),
  };
}

/**
 * Validate and transform search results
 */
export function validateSearchResults(
  results: (Record<string, unknown> & { status: ProductStatus })[],
): Record<string, unknown>[] {
  return results.map(transformProductData);
}

/**
 * Convert a string to title case
 * @param str - The input string
 * @returns The string in title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/) // split on whitespace
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
