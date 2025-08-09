'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log error details for debugging
    console.error('Component stack:', errorInfo.componentStack);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // If we were showing an error and the children changed (e.g., user retried
    // with a non-throwing child), clear the error state to re-render children
    if (this.state.hasError && this.props.children !== prevProps.children) {
      // Use flushSync to make the reset visible immediately in tests
      flushSync(() => {
        this.setState({ hasError: false, error: undefined });
      });
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error monitoring service
    // e.g., Sentry, LogRocket, Bugsnag, etc.
    try {
      const safeUserAgent =
        typeof navigator !== 'undefined' && navigator && 'userAgent' in navigator
          ? (navigator.userAgent as string)
          : '';
      const safeUrl =
        typeof window !== 'undefined' && typeof window.location !== 'undefined' && window.location
          ? (window.location.href ?? '')
          : '';

      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: safeUserAgent,
        url: safeUrl,
      };

      // Example: Send to monitoring service
      // monitoringService.captureException(errorReport);
      console.warn('Error reported to monitoring service:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    // Ensure the reset happens synchronously so subsequent renders/tests see the updated state
    flushSync(() => {
      this.setState({ hasError: false, error: undefined });
    });

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Auto-retry after a delay if the error persists
    this.retryTimeoutId = setTimeout(() => {
      if (this.state.hasError) {
        console.warn('Error persisted after retry attempt');
      }
    }, 5000);
  };

  handleReload = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  An unexpected error occurred while loading this page. Please try refreshing or
                  contact support if the problem persists.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={this.handleRetry} className="gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Try again
                  </Button>
                  <Button variant="outline" size="sm" onClick={this.handleReload} className="gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Refresh page
                  </Button>
                </div>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Error details (development only)
                    </summary>
                    <pre className="text-muted-foreground mt-2 text-xs whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Wrapper component for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundaryWrapper({ children, fallback, onError }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}
