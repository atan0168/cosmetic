import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  variant = 'destructive',
  onRetry,
  retryText = 'Try again',
  className,
}: ErrorMessageProps) {
  const Icon = variant === 'destructive' ? XCircle : AlertTriangle;

  return (
    <Alert variant={variant} className={cn('', className)} role="alert" aria-live="polite">
      <Icon className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
            aria-label={`${retryText} - ${message}`}
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            {retryText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Specific error message variants for common scenarios
export function SearchErrorMessage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Search Unavailable"
      message="We couldn't complete your search. Please check your connection and try again."
      onRetry={onRetry}
      retryText="Retry search"
    />
  );
}

export function ValidationErrorMessage({ message }: { message: string }) {
  return <ErrorMessage title="Invalid Input" message={message} variant="default" />;
}

export function NoResultsMessage({ query }: { query: string }) {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
      <AlertTitle className="text-yellow-800">No Products Found</AlertTitle>
      <AlertDescription className="text-yellow-700">
        No products found for &quot;{query}&quot;. Try a different name or notification number.
      </AlertDescription>
    </Alert>
  );
}
