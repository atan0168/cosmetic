import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { AlternativesSection } from '../alternatives-section';
import { Product, ProductStatus, RiskLevel } from '@/types/product';

// Mock the useAlternatives hook
vi.mock('@/hooks/useAlternatives', () => ({
  useAlternatives: vi.fn(),
}));

import { useAlternatives } from '@/hooks/useAlternatives';
const mockUseAlternatives = vi.mocked(useAlternatives);

type UseAlternativesResult = ReturnType<typeof useAlternatives>;
const asUseAlternativesResult = (value: unknown) => value as unknown as UseAlternativesResult;

// Test data
const mockCancelledProduct: Product = {
  id: 1,
  name: 'Cancelled Lipstick',
  notifNo: 'NOTIF123',
  category: 'Lipstick',
  status: ProductStatus.CANCELLED,
  riskLevel: RiskLevel.UNSAFE,
  reasonForCancellation: 'Contains harmful ingredient',
  dateNotified: '2023-01-01',
  applicantCompany: { id: 1, name: 'Test Company' },
  isVerticallyIntegrated: false,
  recencyScore: 0.5,
};

const mockSafeProduct: Product = {
  id: 3,
  name: 'Safe Product',
  notifNo: 'NOTIF789',
  category: 'Mascara',
  status: ProductStatus.APPROVED,
  riskLevel: RiskLevel.SAFE,
  dateNotified: '2023-01-01',
  applicantCompany: { id: 3, name: 'Safe Company' },
  isVerticallyIntegrated: false,
  recencyScore: 0.8,
};

const mockAlternatives: Product[] = [
  {
    id: 10,
    name: 'Safe Alternative 1',
    notifNo: 'ALT001',
    category: 'Lipstick',
    status: ProductStatus.APPROVED,
    riskLevel: RiskLevel.SAFE,
    dateNotified: '2023-02-01',
    applicantCompany: { id: 10, name: 'Safe Brand 1' },
    isVerticallyIntegrated: false,
    recencyScore: 0.9,
  },
];

// Test wrapper with QueryClient
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('AlternativesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility Logic', () => {
    it('should not render for safe products', () => {
      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: undefined,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      const { container } = render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockSafeProduct} />
        </TestWrapper>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render for cancelled products', () => {
      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: { alternatives: [], total: 0 },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Safer Alternatives')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner and message', () => {
      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: undefined,
          isLoading: true,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByRole('status', { name: /loading alternatives/i })).toBeInTheDocument();
      expect(screen.getByText('Finding safer alternatives...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message with retry button', () => {
      const mockRefetch = vi.fn();
      const mockError = new Error('Failed to fetch alternatives');

      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: undefined,
          isLoading: false,
          error: mockError,
          refetch: mockRefetch,
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('Unable to load alternatives')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch alternatives')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should display no alternatives found message', () => {
      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: { alternatives: [], total: 0, message: 'No safer alternatives found.' },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(screen.getByText('No safer alternatives found.')).toBeInTheDocument();
      expect(screen.getByText(/we couldn't find similar approved products/i)).toBeInTheDocument();
    });
  });

  describe('Alternatives Display', () => {
    it('should display list of alternatives', () => {
      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: { alternatives: mockAlternatives, total: 1 },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(
        screen.getByText('Here are some safer alternatives you might consider:'),
      ).toBeInTheDocument();
      expect(screen.getByRole('list', { name: /safer alternatives/i })).toBeInTheDocument();

      // Check that alternative is displayed
      expect(screen.getByText('Safe Alternative 1')).toBeInTheDocument();
      expect(screen.getByText('Notification: ALT001')).toBeInTheDocument();
    });

    it('should display additional safety note', () => {
      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: { alternatives: mockAlternatives, total: 1 },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(
        screen.getByText(/these alternatives are currently approved products/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/always check the latest safety information/i)).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onAlternativeClick when alternative is clicked', () => {
      const mockOnAlternativeClick = vi.fn();

      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: { alternatives: [mockAlternatives[0]], total: 1 },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection
            currentProduct={mockCancelledProduct}
            onAlternativeClick={mockOnAlternativeClick}
          />
        </TestWrapper>,
      );

      const alternativeCard = screen.getByRole('button', {
        name: /view details for safe alternative 1/i,
      });
      fireEvent.click(alternativeCard);

      expect(mockOnAlternativeClick).toHaveBeenCalledWith(mockAlternatives[0]);
    });
  });

  describe('Hook Integration', () => {
    it('should call useAlternatives with correct parameters', () => {
      mockUseAlternatives.mockReturnValue(
        asUseAlternativesResult({
          data: { alternatives: [], total: 0 },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
          isRefetching: false,
        }),
      );

      render(
        <TestWrapper>
          <AlternativesSection currentProduct={mockCancelledProduct} />
        </TestWrapper>,
      );

      expect(mockUseAlternatives).toHaveBeenCalledWith({
        excludeId: mockCancelledProduct.id,
        limit: 3,
        enabled: true,
      });
    });
  });
});
