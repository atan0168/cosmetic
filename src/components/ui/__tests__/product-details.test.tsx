import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductDetails } from '../product-details';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock product data for testing
const mockApprovedProduct: Product = {
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
  recencyScore: 0.85,
};

const mockCancelledProduct: Product = {
  id: 2,
  name: 'Dangerous Foundation',
  notifNo: 'CPNP-789012',
  category: 'Face Products',
  status: ProductStatus.CANCELLED,
  riskLevel: RiskLevel.UNSAFE,
  reasonForCancellation: 'Contains harmful ingredient XYZ that may cause skin irritation',
  dateNotified: '2023-06-20',
  applicantCompany: {
    id: 3,
    name: 'Risky Cosmetics',
  },
  isVerticallyIntegrated: true,
  recencyScore: 0.45,
};

const mockCancelledProductNoReason: Product = {
  id: 3,
  name: 'Unknown Risk Product',
  notifNo: 'CPNP-345678',
  category: 'Hair Products',
  status: ProductStatus.CANCELLED,
  riskLevel: RiskLevel.UNSAFE,
  reasonForCancellation: '',
  dateNotified: '2023-12-01',
  applicantCompany: {
    id: 4,
    name: 'Hair Solutions Ltd',
  },
  isVerticallyIntegrated: false,
  recencyScore: 0.12,
};

describe('ProductDetails', () => {
  describe('Basic Rendering', () => {
    it('renders product name and notification number', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      expect(screen.getByText('Test Lipstick')).toBeInTheDocument();
      expect(screen.getByText('Notification: CPNP-123456')).toBeInTheDocument();
    });

    it('renders product category when available', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      expect(screen.getByText('Category:')).toBeInTheDocument();
      expect(screen.getByText('Lip Products')).toBeInTheDocument();
    });

    it('renders risk indicator', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      // Risk indicator should be present (tested in its own component test)
      expect(screen.getByTestId('risk-indicator')).toBeInTheDocument();
    });

    it('renders status badge', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      expect(screen.getByText('Notified')).toBeInTheDocument();
    });
  });

  describe('Cancellation Reasons', () => {
    it('displays cancellation reason for cancelled products', () => {
      render(<ProductDetails product={mockCancelledProduct} />);

      expect(screen.getByText('Reason for Cancellation')).toBeInTheDocument();
      expect(
        screen.getByText('Contains harmful ingredient XYZ that may cause skin irritation'),
      ).toBeInTheDocument();
    });

    it('displays fallback message when cancellation reason is missing', () => {
      render(<ProductDetails product={mockCancelledProductNoReason} />);

      expect(screen.getByText('Reason for Cancellation')).toBeInTheDocument();
      expect(screen.getByText('Reason not specified')).toBeInTheDocument();
    });

    it('displays fallback message when cancellation reason is empty string', () => {
      const productWithEmptyReason = {
        ...mockCancelledProduct,
        reasonForCancellation: '   ', // whitespace only
      };

      render(<ProductDetails product={productWithEmptyReason} />);

      expect(screen.getByText('Reason not specified')).toBeInTheDocument();
    });

    it('does not display cancellation reason section for approved products', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      expect(screen.queryByText('Reason for Cancellation')).not.toBeInTheDocument();
    });

    it('formats cancellation reason with proper capitalization', () => {
      const productWithLowercaseReason = {
        ...mockCancelledProduct,
        reasonForCancellation: 'contains banned substance',
      };

      render(<ProductDetails product={productWithLowercaseReason} />);

      expect(screen.getByText('Contains banned substance')).toBeInTheDocument();
    });

    it('cleans up multiple spaces in cancellation reason', () => {
      const productWithMessyReason = {
        ...mockCancelledProduct,
        reasonForCancellation: '  contains    multiple   spaces  ',
      };

      render(<ProductDetails product={productWithMessyReason} />);

      expect(screen.getByText('Contains multiple spaces')).toBeInTheDocument();
    });
  });

  describe('Expandable Details', () => {
    it('shows "Show Details" button when collapsed', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      expect(screen.getByText('Show Details')).toBeInTheDocument();
      expect(screen.queryByText('Hide Details')).not.toBeInTheDocument();
    });

    it('shows "Hide Details" button when expanded', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Hide Details')).toBeInTheDocument();
      expect(screen.queryByText('Show Details')).not.toBeInTheDocument();
    });

    it('toggles details visibility when button is clicked', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      const toggleButton = screen.getByText('Show Details');

      // Initially collapsed - details should not be visible
      expect(screen.queryByText('Company Information')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(toggleButton);

      expect(screen.getByText('Company Information')).toBeInTheDocument();
      expect(screen.getByText('Hide Details')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('Hide Details'));

      expect(screen.queryByText('Company Information')).not.toBeInTheDocument();
      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    it('can be initialized as expanded', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Company Information')).toBeInTheDocument();
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
    });
  });

  describe('Company Information', () => {
    it('displays applicant company when expanded', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Applicant Company:')).toBeInTheDocument();
      expect(screen.getByText('Beauty Corp Ltd')).toBeInTheDocument();
    });

    it('displays manufacturer company when available and expanded', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Manufacturer:')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing Inc')).toBeInTheDocument();
    });

    it('shows vertically integrated badge when applicable', () => {
      render(<ProductDetails product={mockCancelledProduct} defaultExpanded={true} />);

      expect(screen.getByText('Vertically Integrated')).toBeInTheDocument();
    });

    it('does not show vertically integrated badge when not applicable', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.queryByText('Vertically Integrated')).not.toBeInTheDocument();
    });
  });

  describe('Date Information', () => {
    it('displays formatted notification date when expanded', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Date Notified:')).toBeInTheDocument();
      expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    });

    it('handles invalid date gracefully', () => {
      const productWithInvalidDate = {
        ...mockApprovedProduct,
        dateNotified: 'invalid-date',
      };

      render(<ProductDetails product={productWithInvalidDate} defaultExpanded={true} />);

      expect(screen.getByText('Date Notified:')).toBeInTheDocument();
      // The component should display the invalid date as-is when it can't be parsed
      expect(screen.getByText('invalid-date')).toBeInTheDocument();
    });
  });

  describe('Safety Information for Cancelled Products', () => {
    it('displays safety notice for cancelled products when expanded', () => {
      render(<ProductDetails product={mockCancelledProduct} defaultExpanded={true} />);

      expect(screen.getByText('Safety Information')).toBeInTheDocument();
      expect(screen.getByText('Product Safety Notice')).toBeInTheDocument();
      expect(
        screen.getByText(/This product has been cancelled and should not be used/),
      ).toBeInTheDocument();
    });

    it('does not display safety notice for approved products', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.queryByText('Product Safety Notice')).not.toBeInTheDocument();
    });
  });

  describe('Additional Information', () => {
    it('displays product ID and recency score when expanded', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Additional Information')).toBeInTheDocument();
      expect(screen.getByText('Product ID:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Recency Score:')).toBeInTheDocument();
      expect(screen.getByText('0.85')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for expandable content', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      const toggleButton = screen.getByRole('button', { name: /show details/i });

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(toggleButton).toHaveAttribute('aria-controls', 'product-details-content');

      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper semantic structure with headings', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Company Information')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    it('uses appropriate icons with aria-hidden', () => {
      render(<ProductDetails product={mockApprovedProduct} />);

      // Icons should be present with aria-hidden attribute
      const svgElements = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ProductDetails product={mockApprovedProduct} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('respects defaultExpanded prop', () => {
      render(<ProductDetails product={mockApprovedProduct} defaultExpanded={true} />);

      expect(screen.getByText('Company Information')).toBeInTheDocument();
    });
  });
});
