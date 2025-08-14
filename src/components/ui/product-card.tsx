import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, FileText } from 'lucide-react';
import { Product, ProductStatus } from '@/types/product';
import { toTitleCase } from '@/lib/utils/product';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isClickable
          ? 'hover:border-primary/20 focus:border-primary focus:ring-primary/20 cursor-pointer hover:shadow-md focus:shadow-md focus:ring-2'
          : ''
      } ${className || ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `View details for ${product.name}` : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="text-lg leading-tight font-semibold break-words">
            {toTitleCase(product.name)}
          </CardTitle>
          <div className="flex-shrink-0">
            <RiskIndicator riskLevel={product.riskLevel} />
          </div>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="break-all">Notification: {product.notifNo}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Company Information */}
        {product.applicantCompany && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="text-muted-foreground h-4 w-4" aria-hidden="true" />
            <span className="text-muted-foreground">Company:</span>
            <span className="font-medium">{toTitleCase(product.applicantCompany.name)}</span>
          </div>
        )}
        {/* Date Information */}
        {product.dateNotified && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-muted-foreground h-4 w-4" aria-hidden="true" />
            <span className="text-muted-foreground">Approved:</span>
            <span>{new Date(product.dateNotified).toLocaleDateString()}</span>
          </div>
        )}
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant={product.status === ProductStatus.CANCELLED ? 'destructive' : 'success'}
            className="text-xs"
          >
            {product.status}
          </Badge>
        </div>
        {/* Cancellation Reason */}
        {product.reasonForCancellation && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">Reason for cancellation:</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Product contains dangerous/banned substance </span>
              <span className="font-bold text-red-600">
                {toTitleCase(product.reasonForCancellation)}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
