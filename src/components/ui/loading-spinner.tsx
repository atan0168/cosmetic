import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeConfig = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      role="status"
      aria-label={text || 'Loading'}
    >
      <Loader2
        className={cn('text-muted-foreground animate-spin', sizeConfig[size])}
        aria-hidden="true"
      />
      {text && <span className="text-muted-foreground text-sm">{text}</span>}
      <span className="sr-only">{text || 'Loading'}</span>
    </div>
  );
}

// Skeleton loading component for product cards
export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
