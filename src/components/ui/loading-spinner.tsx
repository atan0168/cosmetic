import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Droplets, Heart, Shield, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

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

// Animated loading component with cycling cosmetic icons
export function CosmeticLoadingAnimation({
  size = 'md',
  className,
  text,
  speed = 'normal',
}: LoadingSpinnerProps & { speed?: 'slow' | 'normal' | 'fast' }) {
  const [currentIcon, setCurrentIcon] = useState(0);

  const icons = [
    { icon: Sparkles, label: 'Sparkles' },
    { icon: Droplets, label: 'Droplets' },
    { icon: Heart, label: 'Heart' },
    { icon: Shield, label: 'Shield' },
    { icon: Star, label: 'Star' },
  ];

  const speedConfig = {
    slow: 800,
    normal: 500,
    fast: 300,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, speedConfig[speed]);

    return () => clearInterval(interval);
  }, [speed]);

  const CurrentIcon = icons[currentIcon].icon;

  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      role="status"
      aria-label={text || 'Loading cosmetic products'}
    >
      <div className="relative">
        <CurrentIcon
          className={cn('text-primary animate-pulse transition-all duration-300', sizeConfig[size])}
          aria-hidden="true"
        />
        {/* Subtle glow effect */}
        <div
          className={cn(
            'bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-sm',
            sizeConfig[size],
          )}
          aria-hidden="true"
        />
      </div>
      {text && <span className="text-muted-foreground text-sm">{text}</span>}
      <span className="sr-only">
        {text || `Loading cosmetic products, current icon: ${icons[currentIcon].label}`}
      </span>
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
