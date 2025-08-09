import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary, ErrorBoundaryWrapper, useErrorBoundary } from '../error-boundary';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    console.error = vi.fn();
    console.warn = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  // Component that throws an error for testing
  const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error message');
    }
    return <div>No error</div>;
  };

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('renders custom fallback UI when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when an error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('logs error details to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    expect(console.error).toHaveBeenCalledWith(
      'Component stack:',
      expect.any(String)
    );
  });

  it('shows error details in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error details (development only)')).toBeInTheDocument();

  });

  it('hides error details in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error details (development only)')).not.toBeInTheDocument();

  });

  it('resets error state when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Rerender with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('reloads page when refresh button is clicked', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /refresh page/i }));

    expect(mockReload).toHaveBeenCalled();
  });

  it('sets up retry timeout after retry attempt', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(5000);

    expect(console.warn).toHaveBeenCalledWith('Error persisted after retry attempt');
  });

  it('reports errors in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.warn).toHaveBeenCalledWith(
      'Error reported to monitoring service:',
      expect.objectContaining({
        message: 'Test error message',
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String),
      })
    );

  });

  it('handles reporting errors gracefully when reporting fails', () => {
    vi.stubEnv('NODE_ENV', 'production');

    // Mock navigator to throw an error
    Object.defineProperty(navigator, 'userAgent', {
      get: () => {
        throw new Error('Navigator error');
      },
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Failed to report error:',
      expect.any(Error)
    );

  });

  it('clears timeout on unmount', () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Unmount component
    unmount();

    // Fast-forward time - should not trigger timeout warning
    vi.advanceTimersByTime(5000);

    expect(console.warn).not.toHaveBeenCalledWith('Error persisted after retry attempt');
  });
});

describe('ErrorBoundaryWrapper', () => {
  // Local ThrowError for this block to avoid scope issues
  const ThrowErrorInWrapper = () => {
    throw new Error('Wrapper error');
  };

  it('renders ErrorBoundary with correct props', () => {
    const onError = vi.fn();
    const fallback = <div>Custom fallback</div>;

    render(
      <ErrorBoundaryWrapper onError={onError} fallback={fallback}>
        <ThrowErrorInWrapper />
      </ErrorBoundaryWrapper>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });
});

describe('useErrorBoundary', () => {
  const TestComponent = () => {
    const { captureError, resetError } = useErrorBoundary();
    const [hasError, setHasError] = React.useState(false);

    const handleError = () => {
      try {
        captureError(new Error('Captured error'));
      } catch {
        setHasError(true);
      }
    };

    const handleReset = () => {
      resetError();
      setHasError(false);
    };

    if (hasError) {
      return (
        <div>
          <div>Error captured</div>
          <button onClick={handleReset}>Reset</button>
        </div>
      );
    }

    return (
      <div>
        <div>No error</div>
        <button onClick={handleError}>Trigger Error</button>
      </div>
    );
  };

  it('provides error capture and reset functionality', () => {
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();

    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});