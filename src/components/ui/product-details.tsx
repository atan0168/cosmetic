'use client';

import { useState } from 'react';
import { Product, ProductStatus } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  FileText,
  AlertTriangle,
  Info,
  Factory,
} from 'lucide-react';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import { AlternativesSection } from '@/components/ui/alternatives-section';
import { toTitleCase } from '@/lib/utils/product';

interface ProductDetailsProps {
  product: Product;
  className?: string;
  defaultExpanded?: boolean;
  onAlternativeClick?: (product: Product) => void;
}

export function ProductDetails({
  product,
  className,
  defaultExpanded = false,
  onAlternativeClick,
}: ProductDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const formatCancellationReason = (reason?: string): string => {
    if (!reason || reason.trim() === '') {
      return 'Reason not specified';
    }

    // Clean up the reason text for better readability
    const cleanedReason = reason
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter

    return cleanedReason;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl leading-tight font-semibold">
              {toTitleCase(product.name)}
            </CardTitle>
            <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>Notification: {product.notifNo}</span>
            </div>
          </div>
          <RiskIndicator riskLevel={product.riskLevel} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge
              variant={product.status === ProductStatus.CANCELLED ? 'destructive' : 'default'}
              className="text-xs"
            >
              {product.status}
            </Badge>
          </div>

          {/* Category */}
          {product.category && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{toTitleCase(product.category)}</span>
            </div>
          )}
        </div>

        {/* Cancellation Reason - Always visible for cancelled products */}
        {product.status === ProductStatus.CANCELLED && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Reason for Cancellation</p>
                <p className="mt-1 text-sm text-red-800">
                  {formatCancellationReason(product.reasonForCancellation)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Details Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-between !p-0 text-sm font-normal hover:bg-transparent"
              aria-expanded={isExpanded}
              aria-controls="product-details-content"
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" aria-hidden="true" />
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent id="product-details-content" className="mt-4 space-y-4 border-t pt-4">
            {/* Company Information */}
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Company Information
              </h4>

              {product.applicantCompany && (
                <div className="flex items-start gap-3 text-sm">
                  <Building2
                    className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-muted-foreground">Applicant Company:</span>
                    <p className="font-medium">{toTitleCase(product.applicantCompany.name)}</p>
                  </div>
                </div>
              )}

              {product.manufacturerCompany && (
                <div className="flex items-start gap-3 text-sm">
                  <Factory
                    className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <p className="font-medium">{toTitleCase(product.manufacturerCompany.name)}</p>
                  </div>
                </div>
              )}

              {product.isVerticallyIntegrated && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    Vertically Integrated
                  </Badge>
                </div>
              )}
            </div>

            {/* Date Information */}
            {product.dateNotified && (
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                  Timeline
                </h4>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar
                    className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-muted-foreground">Date Approved:</span>
                    <p className="font-medium">{formatDate(product.dateNotified)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information for Cancelled Products */}
            {product.status === ProductStatus.CANCELLED && (
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                  Safety Information
                </h4>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900">Product Safety Notice</p>
                      <p className="mt-1 text-amber-800">
                        This product has been cancelled and should not be used. The cancellation
                        indicates potential safety concerns identified by regulatory authorities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Additional Information
              </h4>
              <div className="text-muted-foreground grid gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="font-mono">{product.id}</span>
                </div>
                {product.recencyScore !== undefined && (
                  <div className="flex justify-between">
                    <span>Recency Score:</span>
                    <span className="font-mono">{product.recencyScore.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Alternative Products Section for Banned/Cancelled Products */}
        <AlternativesSection
          currentProduct={product}
          onAlternativeClick={onAlternativeClick}
          className="mt-4"
        />
      </CardContent>
    </Card>
  );
}
