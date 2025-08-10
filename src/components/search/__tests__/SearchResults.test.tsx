import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SearchResults } from '../SearchResults';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock the UI components
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ size, text }: { size?: string; text?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>
      {text}
    </div>
  ),
  ProductCardSkeleton: () => <div data-testid="product-card-skeleton" />,
}));

vi.mock('@/components/ui/error-message', () => ({
  ErrorMessage: ({ title, message }: { title: string; message: string }) => (
    <div data-testid="error-message">
      <div data-testid="error-title">{title}</div>
      <div data-testid="error-message-text">{message}</div>
    </div>
  ),
}));

vi.mock('@/components/ui/product-card', () => ({
  ProductCard: ({ product, onClick }: { product: Product; onClick?: () => void }) => (
    <div
      data-testid="product-card"
      data-product-id={product.id}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div data-testid="product-name">{product.name}</div>
      <div data-testid="product-status">{product.status}</div>
      <div data-testid="product-risk">{product.riskLevel}</div>
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Search: () => <div data-testid="search-icon" />,
}));

describe('SearchResults', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Lipstick',
      notifNo: 'CPNP-123456',
      category: 'Makeup',
      status: ProductStatus.APPROVED,
      riskLevel: RiskLevel.SAFE,
      dateNotified: '2024-01-15',
      applicantCompany: { id: 1, name: 'Test Company' },
      isVerticallyIntegrated: false,
      recencyScore: 0.8,
    },
    {
      id: 2,
      name: 'Dangerous Foundation',
      notifNo: 'CPNP-789012',
      category: 'Makeup',
      status: ProductStatus.CANCELLED,
      riskLevel: RiskLevel.UNSAFE,
      reasonForCancellation: 'Contains harmful chemicals',
      dateNotified: '2024-02-20',
      applicantCompany: { id: 2, name: 'Another Company' },
      isVerticallyIntegrated: true,
      recencyScore: 0.3,
    },
  ];

  const defaultProps = {
    products: [],
    isLoading: false,
    error: null,
    query: '',
    onProductClick: undefined,
    className: '',
  };

  describe('Loading State', () => {
    it('displays loading spinner and skeleton when isLoading is true', () => {
      render(<SearchResults {...defaultProps} isLoading={true} query="lipstick" />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading search results');
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-skeleton')).toBeInTheDocument();
      expect(screen.getByText('Searching for "lipstick"...')).toBeInTheDocument();
    });

    it('displays loading spinner with correct size', () => {
      render(<SearchResults {...defaultProps} isLoading={true} query="test" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('Error State', () => {
    it('displays error message when error is provided', () => {
      const errorMessage = 'Search unavailable. Please try again later.';

      render(<SearchResults {...defaultProps} error={errorMessage} query="lipstick" />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-title')).toHaveTextContent('Search Error');
      expect(screen.getByTestId('error-message-text')).toHaveTextContent(errorMessage);
    });

    it('does not display loading or results when error is present', () => {
      render(
        <SearchResults
          {...defaultProps}
          error="Some error"
          query="lipstick"
          products={mockProducts}
        />,
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  describe('Empty State - No Query', () => {
    it('displays initial search prompt when no query is provided', () => {
      render(<SearchResults {...defaultProps} />);

      expect(screen.getByAltText('Search icon')).toBeInTheDocument();
      expect(screen.getByText('Search for Products')).toBeInTheDocument();
      expect(screen.getByText(/Enter a product name or notification number/)).toBeInTheDocument();
    });

    it('displays initial search prompt when query is empty string', () => {
      render(<SearchResults {...defaultProps} query="" />);

      expect(screen.getByText('Search for Products')).toBeInTheDocument();
    });

    it('displays initial search prompt when query is only whitespace', () => {
      render(<SearchResults {...defaultProps} query="   " />);

      expect(screen.getByText('Search for Products')).toBeInTheDocument();
    });
  });

  describe('Empty Results State', () => {
    it('displays no results message when products array is empty but query exists', () => {
      render(<SearchResults {...defaultProps} query="nonexistent product" products={[]} />);

      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('No Products Found')).toBeInTheDocument();
      expect(screen.getByText(/No products found for/)).toBeInTheDocument();
      expect(screen.getByText('"nonexistent product"')).toBeInTheDocument();
      expect(screen.getByText(/Try a different name or notification number/)).toBeInTheDocument();
    });

    it('displays search tips in empty results state', () => {
      render(<SearchResults {...defaultProps} query="test" products={[]} />);

      expect(screen.getByText('Search tips:')).toBeInTheDocument();
      expect(screen.getByText('• Try using fewer or different keywords')).toBeInTheDocument();
      expect(screen.getByText('• Check the spelling of product names')).toBeInTheDocument();
      expect(
        screen.getByText('• Use the full notification number if available'),
      ).toBeInTheDocument();
    });
  });

  describe('Results State', () => {
    it('displays search results with correct header information', () => {
      render(<SearchResults {...defaultProps} query="lipstick" products={mockProducts} />);

      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('(2 products found)')).toBeInTheDocument();
      expect(screen.getByText('Results for')).toBeInTheDocument();
      expect(screen.getByText('"lipstick"')).toBeInTheDocument();
    });

    it('displays singular product count correctly', () => {
      render(<SearchResults {...defaultProps} query="lipstick" products={[mockProducts[0]]} />);

      expect(screen.getByText('(1 product found)')).toBeInTheDocument();
    });

    it('renders all products as ProductCard components', () => {
      render(<SearchResults {...defaultProps} query="lipstick" products={mockProducts} />);

      const productCards = screen.getAllByTestId('product-card');
      expect(productCards).toHaveLength(2);

      expect(screen.getByText('Test Lipstick')).toBeInTheDocument();
      expect(screen.getByText('Dangerous Foundation')).toBeInTheDocument();
    });

    it('sets up proper accessibility attributes for results list', () => {
      render(<SearchResults {...defaultProps} query="lipstick" products={mockProducts} />);

      const resultsList = screen.getByRole('list');
      expect(resultsList).toHaveAttribute('aria-label', '2 search results for lipstick');

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('displays safety information footer', () => {
      render(<SearchResults {...defaultProps} query="lipstick" products={mockProducts} />);

      expect(screen.getByText('Safety Information')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Product safety status is based on official cosmetic notification databases/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Product Click Handling', () => {
    it('passes onProductClick handler to ProductCard components', () => {
      const mockOnProductClick = vi.fn();

      render(
        <SearchResults
          {...defaultProps}
          query="lipstick"
          products={mockProducts}
          onProductClick={mockOnProductClick}
        />,
      );

      const productCards = screen.getAllByTestId('product-card');
      expect(productCards[0]).toHaveAttribute('role', 'button');
      expect(productCards[1]).toHaveAttribute('role', 'button');
    });

    it('does not set role=button when onProductClick is not provided', () => {
      render(<SearchResults {...defaultProps} query="lipstick" products={mockProducts} />);

      const productCards = screen.getAllByTestId('product-card');
      expect(productCards[0]).not.toHaveAttribute('role', 'button');
      expect(productCards[1]).not.toHaveAttribute('role', 'button');
    });
  });

  describe('CSS Classes', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <SearchResults
          {...defaultProps}
          className="custom-class"
          query="test"
          products={mockProducts}
        />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies className in loading state', () => {
      const { container } = render(
        <SearchResults {...defaultProps} className="loading-class" isLoading={true} query="test" />,
      );

      expect(container.firstChild).toHaveClass('loading-class');
    });

    it('applies className in error state', () => {
      const { container } = render(
        <SearchResults {...defaultProps} className="error-class" error="Some error" query="test" />,
      );

      expect(container.firstChild).toHaveClass('error-class');
    });
  });

  describe('State Priority', () => {
    it('shows loading state even when error is present', () => {
      render(
        <SearchResults
          {...defaultProps}
          isLoading={true}
          error="Some error"
          query="test"
          products={mockProducts}
        />,
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
    });

    it('shows error state over results when error is present', () => {
      render(
        <SearchResults {...defaultProps} error="Some error" query="test" products={mockProducts} />,
      );

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
    });

    it('shows empty query state over empty results', () => {
      render(<SearchResults {...defaultProps} query="" products={[]} />);

      expect(screen.getByText('Search for Products')).toBeInTheDocument();
      expect(screen.queryByText('No Products Found')).not.toBeInTheDocument();
    });
  });
});
