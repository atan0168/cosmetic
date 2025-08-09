import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, FileText } from 'lucide-react';
import { Product, ProductStatus } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={`transition-all duration-200 ${
        isClickable ? 'hover:border-primary/20 cursor-pointer hover:shadow-md' : ''
      } ${className || ''}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === ' ') {
                // Prevent page scroll; rely on default click synthesized for role=button
                e.preventDefault();
              }
            }
          : undefined
      }
      aria-label={isClickable ? `View details for ${product.name}` : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-tight font-semibold">{product.name}</CardTitle>
          <RiskIndicator riskLevel={product.riskLevel} />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Notification: {product.notifNo}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Company Information */}
        {product.applicantCompany && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="text-muted-foreground h-4 w-4" aria-hidden="true" />
            <span className="text-muted-foreground">Company:</span>
            <span className="font-medium">{product.applicantCompany.name}</span>
          </div>
        )}

        {/* Date Information */}
        {product.dateNotified && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-muted-foreground h-4 w-4" aria-hidden="true" />
            <span className="text-muted-foreground">Notified:</span>
            <span>{new Date(product.dateNotified).toLocaleDateString()}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant={product.status === ProductStatus.CANCELLED ? 'destructive' : 'default'}
            className="text-xs"
          >
            {product.status}
          </Badge>
        </div>

        {/* Cancellation Reason */}
        {product.reasonForCancellation && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">Reason for cancellation:</span>{' '}
              {product.reasonForCancellation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
