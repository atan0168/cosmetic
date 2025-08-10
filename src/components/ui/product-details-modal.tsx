'use client';

import { Product } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ProductDetails } from '@/components/ui/product-details';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailsModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlternativeClick?: (product: Product) => void;
  navigationHistory?: Product[];
  onNavigateBack?: () => void;
}

export function ProductDetailsModal({
  product,
  open,
  onOpenChange,
  onAlternativeClick,
  navigationHistory = [],
  onNavigateBack,
}: ProductDetailsModalProps) {
  if (!product) return null;

  const showBackButton = navigationHistory.length > 0 && onNavigateBack;
  const previousProduct = navigationHistory[navigationHistory.length - 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className={cn('flex items-center gap-1', showBackButton && '-ml-3.5')}>
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateBack}
                className="text-muted-foreground hover:text-foreground flex h-full cursor-pointer items-center"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className={cn('flex-1', !showBackButton && 'px-6')}>
              <DialogTitle className="text-3xl font-semibold">Product Details</DialogTitle>
              <DialogDescription>Detailed product information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <ProductDetails
            product={product}
            defaultExpanded={true}
            className="border-0 shadow-none"
            onAlternativeClick={onAlternativeClick}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
