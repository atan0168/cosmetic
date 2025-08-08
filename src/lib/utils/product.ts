import { ProductStatus, RiskLevel } from '@/types/product';

/**
 * Calculate risk level based on product status
 */
export function calculateRiskLevel(status: ProductStatus): RiskLevel {
  switch (status) {
    case ProductStatus.NOTIFIED:
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