import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner, ProductCardSkeleton } from '../loading-spinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    expect(screen.getByText('Loading')).toBeInTheDocument();

    // Check for spinner icon
    const spinner = screen.getByRole('status').querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Searching products..." />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Searching products...');
    expect(
      screen.getByText('Searching products...', { selector: 'span:not(.sr-only)' }),
    ).toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status').querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByRole('status').querySelector('svg');
    expect(spinner).toHaveClass('h-6', 'w-6');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status').querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner text="Loading data" />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Loading data');

    // Icon should be hidden from screen readers
    const icon = status.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    // Screen reader text should be present
    expect(screen.getByText('Loading data', { selector: '.sr-only' })).toBeInTheDocument();
  });
});

describe('ProductCardSkeleton', () => {
  it('renders skeleton loading cards', () => {
    render(<ProductCardSkeleton />);

    // Should render 3 skeleton cards
    const skeletonCards = screen.getAllByRole('generic');
    expect(skeletonCards.length).toBeGreaterThan(0);

    // Check for animated elements
    const animatedElements = document.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});
