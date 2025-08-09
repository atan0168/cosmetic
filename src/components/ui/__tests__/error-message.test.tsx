import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  ErrorMessage,
  SearchErrorMessage,
  ValidationErrorMessage,
  NoResultsMessage,
} from '../error-message';

describe('ErrorMessage', () => {
  it('renders error message with default props', () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders custom title', () => {
    render(<ErrorMessage title="Custom Error" message="Something went wrong" />);

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', async () => {
    const user = userEvent.setup();
    const mockRetry = vi.fn();

    render(<ErrorMessage message="Something went wrong" onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(mockRetry).toHaveBeenCalledOnce();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders custom retry text', () => {
    render(
      <ErrorMessage message="Something went wrong" onRetry={() => {}} retryText="Retry Now" />,
    );

    expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ErrorMessage message="Test" className="custom-class" />);

    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<ErrorMessage message="Test" variant="destructive" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'destructive');

    rerender(<ErrorMessage message="Test" variant="default" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'default');
  });

  it('has proper accessibility attributes for retry button', () => {
    render(<ErrorMessage message="Connection failed" onRetry={() => {}} retryText="Retry" />);

    const retryButton = screen.getByRole('button');
    expect(retryButton).toHaveAttribute('aria-label', 'Retry - Connection failed');
  });
});

describe('SearchErrorMessage', () => {
  it('renders search-specific error message', () => {
    render(<SearchErrorMessage />);

    expect(screen.getByText('Search Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/couldn't complete your search/i)).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', async () => {
    const user = userEvent.setup();
    const mockRetry = vi.fn();

    render(<SearchErrorMessage onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry search/i });
    await user.click(retryButton);
    expect(mockRetry).toHaveBeenCalledOnce();
  });
});

describe('ValidationErrorMessage', () => {
  it('renders validation error message', () => {
    render(<ValidationErrorMessage message="Please enter at least 3 characters" />);

    expect(screen.getByText('Invalid Input')).toBeInTheDocument();
    expect(screen.getByText('Please enter at least 3 characters')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('NoResultsMessage', () => {
  it('renders no results message with query', () => {
    render(<NoResultsMessage query="lipstick" />);

    expect(screen.getByText('No Products Found')).toBeInTheDocument();
    expect(screen.getByText(/no products found for.*lipstick/i)).toBeInTheDocument();
    expect(screen.getByText(/try a different name/i)).toBeInTheDocument();
  });

  it('has proper styling for no results', () => {
    render(<NoResultsMessage query="test" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-yellow-200', 'bg-yellow-50');
  });
});
