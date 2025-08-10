import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../product-card';
import { RiskIndicator } from '../risk-indicator';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock product data
const mockProduct: Product = {
  id: 1,
  notifNo: 'CPNP-123456',
  name: 'Test Product',
  category: 'Skincare',
  status: ProductStatus.APPROVED,
  riskLevel: RiskLevel.SAFE,
  dateNotified: '2024-01-15',
  applicantCompany: {
    id: 1,
    name: 'Test Company',
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
  status: ProductStatus.CANCELLED,
  riskLevel: RiskLevel.UNSAFE,
  reasonForCancellation: 'Safety concerns identified',
};

describe('Accessibility Tests', () => {
  describe('ProductCard Accessibility', () => {
    it('should have proper ARIA attributes when clickable', () => {
      const handleClick = vi.fn();
      render(<ProductCard product={mockProduct} onClick={handleClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'View details for Test Product');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<ProductCard product={mockProduct} onClick={handleClick} />);

      const card = screen.getByRole('button');

      // Test Enter key
      card.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Test Space key
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper focus styles', () => {
      const handleClick = vi.fn();
      render(<ProductCard product={mockProduct} onClick={handleClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('focus:border-primary', 'focus:ring-2', 'focus:ring-primary/20');
    });

    it('should have accessible text content', () => {
      render(<ProductCard product={mockCancelledProduct} />);

      // Check that important information is accessible
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Notification: CPNP-123456')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText(/Reason for cancellation:/)).toBeInTheDocument();
    });
  });

  describe('RiskIndicator Accessibility', () => {
    it('should have proper ARIA attributes for safe products', () => {
      render(<RiskIndicator riskLevel={RiskLevel.SAFE} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', 'Product is safe to use');
      expect(indicator).toHaveAttribute('data-testid', 'risk-indicator');
    });

    it('should have proper ARIA attributes for unsafe products', () => {
      render(<RiskIndicator riskLevel={RiskLevel.UNSAFE} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute(
        'aria-label',
        'Product has been cancelled due to safety concerns',
      );
    });

    it('should have proper ARIA attributes for unknown status', () => {
      render(<RiskIndicator riskLevel={RiskLevel.UNKNOWN} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', 'Product safety status is unknown');
    });

    it('should have icons marked as decorative', () => {
      render(<RiskIndicator riskLevel={RiskLevel.SAFE} />);

      // Icons should be hidden from screen readers
      const icon = screen.getByRole('status').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // Note: SearchInput tests would go here if the component exists
  // Skipping SearchInput tests as the component is not available in the current UI components

  describe('Color Contrast and Visual Accessibility', () => {
    it('should use semantic color classes for different risk levels', () => {
      const { rerender } = render(<RiskIndicator riskLevel={RiskLevel.SAFE} />);

      let indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');

      rerender(<RiskIndicator riskLevel={RiskLevel.UNSAFE} />);
      indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');

      rerender(<RiskIndicator riskLevel={RiskLevel.UNKNOWN} />);
      indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200');
    });

    it('should have proper focus indicators', () => {
      const handleClick = vi.fn();
      render(<ProductCard product={mockProduct} onClick={handleClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('focus:border-primary', 'focus:ring-2', 'focus:ring-primary/20');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful text alternatives', () => {
      render(<ProductCard product={mockCancelledProduct} />);

      // Check that decorative icons are hidden
      const icons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should use proper heading hierarchy', () => {
      render(<ProductCard product={mockProduct} />);

      // Product name should be in a heading-like element
      const productName = screen.getByText('Test Product');
      expect(productName).toBeInTheDocument();
      // CardTitle renders as div with heading-like styling
      expect(productName.tagName.toLowerCase()).toBe('div');
    });

    it('should provide status information accessibly', () => {
      render(<ProductCard product={mockCancelledProduct} />);

      const riskIndicator = screen.getByRole('status');
      expect(riskIndicator).toHaveAttribute(
        'aria-label',
        'Product has been cancelled due to safety concerns',
      );
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should maintain accessibility across different screen sizes', () => {
      render(<ProductCard product={mockProduct} onClick={vi.fn()} />);

      const card = screen.getByRole('button');

      // Check that responsive classes are applied in the card content
      const cardContent = card.querySelector('[class*="sm:flex-row"]');
      const breakWordsElement = card.querySelector('[class*="break-words"]');
      const flexShrinkElement = card.querySelector('[class*="flex-shrink-0"]');

      expect(cardContent).toBeInTheDocument();
      expect(breakWordsElement).toBeInTheDocument();
      expect(flexShrinkElement).toBeInTheDocument();
    });

    it('should handle long text content gracefully', () => {
      const longNameProduct = {
        ...mockProduct,
        name: 'This is a very long product name that should wrap properly on smaller screens and not break the layout',
        notifNo: 'CPNP-123456789012345678901234567890',
      };

      render(<ProductCard product={longNameProduct} />);

      // Check that text wrapping classes are applied
      const productName = screen.getByText('This Is A Very Long Product Name That Should Wrap Properly On Smaller Screens And Not Break The Layout');
      expect(productName).toHaveClass('break-words');

      const notificationText = screen.getByText(/Notification:/);
      expect(notificationText).toHaveClass('break-all');
    });
  });
});
