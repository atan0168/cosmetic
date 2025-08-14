'use client';

import { ProductStatus } from '@/types/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Filter } from 'lucide-react';

interface StatusFilterProps {
  value?: ProductStatus;
  onValueChange: (value?: ProductStatus) => void;
  className?: string;
  disabled?: boolean;
}

export function StatusFilter({
  value,
  onValueChange,
  className,
  disabled = false,
}: StatusFilterProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue === 'all') {
      onValueChange(undefined);
    } else {
      onValueChange(newValue as ProductStatus);
    }
  };

  const getStatusIcon = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.APPROVED:
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case ProductStatus.CANCELLED:
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.APPROVED:
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case ProductStatus.CANCELLED:
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <Select value={value || 'all'} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <div className="flex items-center gap-2">
            <SelectValue placeholder="Filter by status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Filter className="text-muted-foreground h-3 w-3" />
              All Products
            </div>
          </SelectItem>
          <SelectItem value={ProductStatus.APPROVED}>
            <div className="flex items-center gap-2">
              {getStatusIcon(ProductStatus.APPROVED)}
              Approved Only
            </div>
          </SelectItem>
          <SelectItem value={ProductStatus.CANCELLED}>
            <div className="flex items-center gap-2">
              {getStatusIcon(ProductStatus.CANCELLED)}
              Cancelled Only
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Show current filter as badge */}
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Filtered by:</span>
          {getStatusBadge(value)}
        </div>
      )}
    </div>
  );
}
