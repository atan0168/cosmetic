import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../product-card';
import { RiskLevel, ProductStatus, type Product } from '@/types/product';

const mockProduct: Product = {
  id: 1,
  name: 'Test Lipstick',
  notifNo: 'CPNP-123456',
  category: 'Lip Products',
  status: ProductStatus.NOTIFIED,
  riskLevel: RiskLevel.SAFE,
  dateNotified: '2024-01-15',
  applicantCompany: {
    id: 1,
    name: 'Beauty Corp Ltd',
  },
  manufacturerCompany: {
    id: 2,
    name: 'Manufacturing Inc',
  },
  isVerticallyIntegrated: false,
  recencyScore: 0.8,
};

const mockCancelledProduct: Product = {
  ...mockProduct,
  id: 2,
  name: 'Dangerous Foundation',
  status: ProductStatus.CANCELLED,
  riskLevel: RiskLevel.UNSAFE,
  reasonForCancellation: 'Contains prohibited ingredient: Lead acetate',
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Lipstick')).toBeInTheDocument();
    expect(screen.getByText('Notification: CPNP-123456')).toBeInTheDocument();
    expect(screen.getByText('Company:')).toBeInTheDocument();
    expect(screen.getByText('Beauty Corp Ltd')).toBeInTheDocument();
    expect(screen.getByText('Notified:')).toBeInTheDocument();
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
  });

  it('renders risk indicator', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('SAFE')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Product is safe to use');
  });

  it('renders status badge correctly for notified product', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Notified')).toBeInTheDocument();
  });

  it('renders status badge correctly for cancelled product', () => {
    render(<ProductCard product={mockCancelledProduct} />);

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders cancellation reason when present', () => {
    render(<ProductCard product={mockCancelledProduct} />);

    expect(screen.getByText('Reason for cancellation:')).toBeInTheDocument();
    expect(screen.getByText('Contains prohibited ingredient: Lead acetate')).toBeInTheDocument();
  });

  it('does not render cancellation reason when not present', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.queryByText('Reason for cancellation:')).not.toBeInTheDocument();
  });

  it('handles click events when onClick is provided', async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();

    render(<ProductCard product={mockProduct} onClick={mockClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'View details for Test Lipstick');

    await user.click(card);
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('handles keyboard events when onClick is provided', async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();

    render(<ProductCard product={mockProduct} onClick={mockClick} />);

    const card = screen.getByRole('button');

    // Test Enter key
    await user.type(card, '{Enter}');
    expect(mockClick).toHaveBeenCalledOnce();

    // Test Space key
    await user.type(card, ' ');
    expect(mockClick).toHaveBeenCalledTimes(2);
  });

  it('does not have button role when onClick is not provided', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies hover styles when clickable', () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md');
  });

  it('does not apply hover styles when not clickable', () => {
    render(<ProductCard product={mockProduct} />);

    const cardContainer = document.querySelector('[class*="transition-all"]');
    expect(cardContainer).not.toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    render(<ProductCard product={mockProduct} className="custom-class" />);

    const cardContainer = document.querySelector('.custom-class');
    expect(cardContainer).toBeInTheDocument();
  });

  it('handles missing company information gracefully', () => {
    const productWithoutCompany = { ...mockProduct, applicantCompany: undefined };
    render(<ProductCard product={productWithoutCompany} />);

    expect(screen.queryByText('Company:')).not.toBeInTheDocument();
  });

  it('handles missing date information gracefully', () => {
    const productWithoutDate = { ...mockProduct, dateNotified: undefined };
    render(<ProductCard product={productWithoutDate} />);

    expect(screen.queryByText('Notified:')).not.toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    // Should have proper heading structure
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Lipstick')).toBeInTheDocument();

    // Icons should be hidden from screen readers
    const icons = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });
});
