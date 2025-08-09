import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the debounce delay for faster tests
const DEBOUNCE_MS = 50;

describe('SearchInput', () => {
  const mockOnSearch = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders with default placeholder', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by product name or notification number...')).toBeInTheDocument();
    expect(screen.getByLabelText('Search for cosmetic products')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const customPlaceholder = 'Custom search placeholder';
    render(<SearchInput onSearch={mockOnSearch} placeholder={customPlaceholder} />);
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it('shows validation hint for queries with less than 3 characters', async () => {
    render(<SearchInput onSearch={mockOnSearch} debounceMs={DEBOUNCE_MS} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'ab');
    
    // Wait for typing to finish and hint to appear
    await waitFor(() => {
      expect(screen.getByText('Please enter at least 3 characters')).toBeInTheDocument();
    }, { timeout: DEBOUNCE_MS + 100 });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('does not show validation hint while user is typing', async () => {
    render(<SearchInput onSearch={mockOnSearch} debounceMs={DEBOUNCE_MS} />);
    
    const input = screen.getByRole('textbox');
    
    // Start typing but don't wait for debounce - should show loading instead
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Should show loading indicator, not validation hint
    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(screen.queryByText('Please enter at least 3 characters')).not.toBeInTheDocument();
  });

  it('triggers search for valid queries after debounce', async () => {
    render(<SearchInput onSearch={mockOnSearch} debounceMs={DEBOUNCE_MS} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'lipstick' } });
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('lipstick');
    }, { timeout: DEBOUNCE_MS + 100 });
  });

  it('shows loading indicator while debouncing', async () => {
    render(<SearchInput onSearch={mockOnSearch} debounceMs={DEBOUNCE_MS} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'lipstick' } });
    
    // Should show loading indicator
    expect(screen.getByText('Searching...')).toBeInTheDocument();
    
    // Wait for debounce to complete
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    }, { timeout: DEBOUNCE_MS + 100 });
  });

  it('clears results when input is empty', async () => {
    render(<SearchInput onSearch={mockOnSearch} initialValue="test" />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('shows clear button when input has value', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('handles form submission with Enter key', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'lipstick' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledWith('lipstick');
  });

  it('shows error on form submission with short query', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('Please enter at least 3 characters')).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('clears error when user starts typing', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Create error state
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('Please enter at least 3 characters')).toBeInTheDocument();
    
    // Start typing again
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Error should be cleared
    expect(screen.queryByText('Please enter at least 3 characters')).not.toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<SearchInput onSearch={mockOnSearch} disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    const customClass = 'custom-search-class';
    const { container } = render(<SearchInput onSearch={mockOnSearch} className={customClass} />);
    
    const searchContainer = container.firstChild;
    expect(searchContainer).toHaveClass(customClass);
  });

  it('sets initial value correctly', () => {
    const initialValue = 'initial search';
    render(<SearchInput onSearch={mockOnSearch} initialValue={initialValue} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(initialValue);
  });

  it('has proper accessibility attributes', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Search for cosmetic products');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('updates accessibility attributes when there is an error', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'search-error');
    });
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveAttribute('id', 'search-error');
    expect(errorElement).toHaveAttribute('aria-live', 'polite');
  });

  it('sanitizes input according to validation schema', async () => {
    render(<SearchInput onSearch={mockOnSearch} debounceMs={DEBOUNCE_MS} />);
    
    const input = screen.getByRole('textbox');
    // Input with HTML tags and extra spaces
    fireEvent.change(input, { target: { value: '  <script>alert("test")</script>  lipstick  ' } });
    
    await waitFor(() => {
      // Should be sanitized (HTML removed, quotes removed, spaces normalized)
      expect(mockOnSearch).toHaveBeenCalledWith('alert(test) lipstick');
    }, { timeout: DEBOUNCE_MS + 100 });
  });

  it('prevents excessive API calls with debouncing', async () => {
    render(<SearchInput onSearch={mockOnSearch} debounceMs={DEBOUNCE_MS} />);
    
    const input = screen.getByRole('textbox');
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 'l' } });
    fireEvent.change(input, { target: { value: 'li' } });
    fireEvent.change(input, { target: { value: 'lip' } });
    fireEvent.change(input, { target: { value: 'lips' } });
    fireEvent.change(input, { target: { value: 'lipst' } });
    fireEvent.change(input, { target: { value: 'lipsti' } });
    fireEvent.change(input, { target: { value: 'lipstic' } });
    fireEvent.change(input, { target: { value: 'lipstick' } });
    
    // Should not have called onSearch yet
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('lipstick');
    }, { timeout: DEBOUNCE_MS + 100 });
  });

  it('handles very long queries by showing error', async () => {
    const longQuery = 'a'.repeat(150); // Longer than 100 character limit
    render(<SearchInput onSearch={mockOnSearch} debounceMs={DEBOUNCE_MS} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: longQuery } });
    
    await waitFor(() => {
      // Should show error for long query
      expect(screen.getByText('Search query too long')).toBeInTheDocument();
    }, { timeout: DEBOUNCE_MS + 100 });
  });
});