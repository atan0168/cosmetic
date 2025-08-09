'use client';

import { Product, ProductStatus, RiskLevel } from '@/types/product';
import { ProductCard } from '@/components/ui/product-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useAlternatives } from '@/hooks/useAlternatives';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlternativesSectionProps {
  currentProduct?: Product;
  onAlternativeClick?: (product: Product) => void;
  className?: string;
}

export function AlternativesSection({
  currentProduct,
  onAlternativeClick,
  className,
}: AlternativesSectionProps) {
  // Only show alternatives for cancelled or unknown products
  const shouldShowAlternatives = 
    currentProduct && 
    (currentProduct.status === ProductStatus.CANCELLED || 
     currentProduct.riskLevel === RiskLevel.UNKNOWN);

  const {
    data: alternativesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAlternatives({
    excludeId: currentProduct?.id,
    limit: 3,
    enabled: shouldShowAlternatives,
  });

  // Don't render if we shouldn't show alternatives
  if (!shouldShowAlternatives) {
    return null;
  }

  const alternatives = alternativesData?.alternatives || [];
  const hasAlternatives = alternatives.length > 0;

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  return (
    <div className={className}>
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        {/* Section Header */}
        <div className="mb-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-green-600" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-green-900">
            Safer Alternatives
          </h3>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-3 py-8" role="status" aria-label="Loading alternatives">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-green-800">Finding safer alternatives...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="py-4">
            <ErrorMessage
              title="Unable to load alternatives"
              message={error instanceof Error ? error.message : 'Please try again later.'}
              variant="default"
              onRetry={handleRetry}
              retryText={isRefetching ? 'Retrying...' : 'Try Again'}
              className="bg-yellow-50 border-yellow-200"
            />
          </div>
        )}

        {/* No Alternatives Found */}
        {!isLoading && !error && !hasAlternatives && (
          <div className="py-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-green-600/60" aria-hidden="true" />
            <p className="text-green-800 font-medium">No safer alternatives found.</p>
            <p className="mt-1 text-sm text-green-700">
              We couldn't find similar approved products at this time. Try searching for products in the same category.
            </p>
          </div>
        )}

        {/* Alternatives List */}
        {!isLoading && !error && hasAlternatives && (
          <>
            <p className="mb-4 text-sm text-green-800">
              Here are some safer alternatives you might consider:
            </p>
            
            <div className="space-y-3" role="list" aria-label="Safer alternatives">
              {alternatives.map((alternative) => (
                <div key={alternative.id} role="listitem">
                  <ProductCard
                    product={alternative}
                    onClick={onAlternativeClick ? () => onAlternativeClick(alternative) : undefined}
                    className="bg-white border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                  />
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-4 rounded-md border border-green-300 bg-green-100 p-3">
              <p className="text-xs text-green-800">
                <strong>Note:</strong> These alternatives are currently approved products. 
                Always check the latest safety information and consult with professionals if you have specific concerns.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}