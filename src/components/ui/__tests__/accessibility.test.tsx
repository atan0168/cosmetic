import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../product-card';
import { RiskIndicator } from '../risk-indicator';
import { SearchInput } from '../../search/SearchInput';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock product data
const mockProduct: Product = {
  id: '1',
  notifNo: 'CPNP-123456',
  name: 'Test Product',
  category: 'Skincare',
  status: ProductStatus.APPROVED,
  riskLevel: RiskLevel.SAFE,
  applicantCompany: {
    id: '1',
    name: 'Test Company'
  }
};

const mockCancelledProduct: Product = {
  ...mockProduct,
  id: '2',
  status: ProductStatus.CANCELLED,
  riskLevel: RiskLevel.UNSAFE,
  reasonForCancellation: 'Safety concerns identified'
};

describe('Accessibility Tests', () => {
  describe('ProductCard Accessibility', () => {
    it('should have proper ARIA attributes when clickable', () => {
      const handleClick = jest.fn();
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
      const handleClick = jest.fn();
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
      const handleClick = jest.fn();
      render(<ProductCard product={mockProduct} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveClass('focus:border-primary', 'focus:ring-2', 'focus:ring-primary/20');
    });

    it('should have accessible text content', () => {
      render(<ProductCard product={mockCancelledProduct} />);
      
      // Check that important information is accessible
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Notification: CPNP-123456')).toBeInTheDocument();
      expect(screen.getByText('Company: Test Company')).toBeInTheDocument();
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
      expect(indicator).toHaveAttribute('aria-label', 'Product has been cancelled due to safety concerns');
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

  describe('SearchInput Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const handleSearch = jest.fn();
      render(<SearchInput onSearch={handleSearch} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search for cosmetic products');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should associate error messages with input', async () => {
      const user = userEvent.setup();
      const handleSearch = jest.fn();
      render(<SearchInput onSearch={handleSearch} />);
      
      const input = screen.getByRole('textbox');
      
      // Type less than 3 characters to trigger validation
      await user.type(input, 'ab');
      await user.tab(); // Blur to show validation hint
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-describedby', 'search-error');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have accessible clear button', async () => {
      const user = userEvent.setup();
      const handleSearch = jest.fn();
      render(<SearchInput onSearch={handleSearch} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test query');
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });

    it('should announce loading state', async () => {
      const user = userEvent.setup();
      const handleSearch = jest.fn();
      render(<SearchInput onSearch={handleSearch} debounceMs={100} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      // Should show loading state briefly
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      
      // Loading message should have aria-live
      const loadingMessage = screen.getByText('Searching...').parentElement;
      expect(loadingMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('should support form submission with Enter key', async () => {
      const user = userEvent.setup();
      const handleSearch = jest.fn();
      render(<SearchInput onSearch={handleSearch} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test query');
      await user.keyboard('{Enter}');
      
      expect(handleSearch).toHaveBeenCalledWith('test query');
    });
  });

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
      const handleClick = jest.fn();
      render(<ProductCard product={mockProduct} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveClass('focus:border-primary', 'focus:ring-2', 'focus:ring-primary/20');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful text alternatives', () => {
      render(<ProductCard product={mockCancelledProduct} />);
      
      // Check that decorative icons are hidden
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should use proper heading hierarchy', () => {
      render(<ProductCard product={mockProduct} />);
      
      // Product name should be in a heading
      const productName = screen.getByText('Test Product');
      expect(productName).toBeInTheDocument();
      // CardTitle renders as h3 by default
      expect(productName.tagName.toLowerCase()).toBe('h3');
    });

    it('should provide status information accessibly', () => {
      render(<ProductCard product={mockCancelledProduct} />);
      
      const riskIndicator = screen.getByRole('status');
      expect(riskIndicator).toHaveAttribute('aria-label', 'Product has been cancelled due to safety concerns');
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should maintain accessibility across different screen sizes', () => {
      render(<ProductCard product={mockProduct} onClick={jest.fn()} />);
      
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
        notifNo: 'CPNP-123456789012345678901234567890'
      };
      
      render(<ProductCard product={longNameProduct} />);
      
      // Check that text wrapping classes are applied
      const productName = screen.getByText(longNameProduct.name);
      expect(productName).toHaveClass('break-words');
      
      const notificationText = screen.getByText(/Notification:/);
      expect(notificationText).toHaveClass('break-all');
    });
  });
});