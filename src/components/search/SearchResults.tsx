'use client';

import { Product } from '@/types/product';
import { ProductCard } from '@/components/ui/product-card';
import { LoadingSpinner, ProductCardSkeleton } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface SearchResultsProps {
  products: Product[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  error: string | null;
  query: string;
  onProductClick?: (product: Product) => void;
  onLoadMore?: () => void;
  hasMoreResults?: boolean;
  totalResults?: number;
  className?: string;
}

export function SearchResults({
  products,
  isLoading,
  isLoadingMore = false,
  error,
  query,
  onProductClick,
  onLoadMore,
  hasMoreResults = false,
  totalResults = 0,
  className,
}: SearchResultsProps) {
  // Loading state with skeleton screens
  if (isLoading) {
    return (
      <div className={className} role="status" aria-label="Loading search results">
        <div className="text-muted-foreground mb-4 flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm">Searching for &quot;{query}&quot;...</span>
        </div>
        <ProductCardSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <ErrorMessage title="Search Error" message={error} />
      </div>
    );
  }

  // Empty state - no query entered yet
  if (!query.trim()) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center px-4 pb-8 pt-4 text-center sm:py-12">
          <Image
            src="/search.svg"
            alt="Search icon"
            width={140}
            height={140}
          />
          <h3 className="text-muted-foreground mb-2 text-base font-semibold sm:text-lg">
            Search for Products
          </h3>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed sm:text-base">
            Enter a product name or notification number to check safety status and find information
            about cosmetic products.
          </p>
        </div>
      </div>
    );
  }

  // Empty results state - query entered but no products found
  if (products.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
          <AlertCircle
            className="text-muted-foreground/50 mb-4 h-10 w-10 sm:h-12 sm:w-12"
            aria-hidden="true"
          />
          <h3 className="text-muted-foreground mb-2 text-base font-semibold sm:text-lg">
            No Products Found
          </h3>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed sm:text-base">
            No products found for{' '}
            <span className="font-medium break-words">&quot;{query}&quot;</span>. Try a different
            name or notification number.
          </p>
          <div className="text-muted-foreground mt-4 max-w-sm text-xs sm:text-sm">
            <p className="font-medium">Search tips:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Try using fewer or different keywords</li>
              <li>• Check the spelling of product names</li>
              <li>• Use the full notification number if available</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Results state - display products
  return (
    <div className={className}>
      {/* Results header */}
      <div className="mb-4 px-1 sm:mb-6">
        <div>
          <h2 className="text-base font-semibold sm:text-lg" id="search-results-heading">
            Search Results
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({products.length}
              {totalResults > 0 && totalResults !== products.length
                ? ` of ${totalResults}`
                : ''}{' '}
              {products.length === 1 ? 'product' : 'products'}{' '}
              {totalResults > 0 && totalResults !== products.length ? 'shown' : 'found'})
            </span>
          </h2>
          <p className="text-muted-foreground text-sm break-words">
            Results for <span className="font-medium">&quot;{query}&quot;</span>
          </p>
        </div>
      </div>

      {/* Product list */}
      <div
        className="space-y-3 sm:space-y-4"
        role="list"
        aria-labelledby="search-results-heading"
        aria-label={`${products.length} search results for ${query}`}
      >
        {products.map((product) => (
          <div key={product.id} role="listitem">
            <ProductCard
              product={product}
              onClick={onProductClick ? () => onProductClick(product) : undefined}
              className="transition-all duration-200 focus-within:shadow-sm hover:shadow-sm"
            />
          </div>
        ))}
      </div>

      {/* View More Button */}
      {hasMoreResults && onLoadMore && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="min-w-[140px] transition-all duration-200 hover:shadow-sm"
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                View More ({totalResults - products.length} remaining)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results footer with additional info */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:mt-8 sm:p-4 dark:border-blue-800 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Safety Information</p>
            <p className="mt-1 leading-relaxed text-blue-800 dark:text-blue-200">
              Product safety status is based on official cosmetic notification databases. Always
              consult with healthcare professionals for specific safety concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
