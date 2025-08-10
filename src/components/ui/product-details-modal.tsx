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

interface ProductDetailsModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({ product, open, onOpenChange }: ProductDetailsModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Product Details</DialogTitle>
          <DialogDescription>Detailed information about {product.name}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <ProductDetails
            product={product}
            defaultExpanded={true}
            className="border-0 shadow-none"
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
