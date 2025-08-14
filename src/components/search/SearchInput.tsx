'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchQuerySchema } from '@/lib/validations';
import { z } from 'zod';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  initialValue?: string;
  debounceMs?: number;
  onClear?: () => void;
}

export function SearchInput({
  onSearch,
  placeholder = 'Search by product name or notification number...',
  className,
  disabled = false,
  initialValue = '',
  debounceMs = 300,
  onClear = () => {},
}: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  // Debounce timer stored across renders
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    // Only trigger search if query has minimum length
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length >= 3) {
      setIsTyping(true);
      debounceTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        try {
          const validated = SearchQuerySchema.parse({ query: value });
          setError('');
          onSearch(validated.query);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const firstError = validationError.issues[0];
            setError(firstError.message);
          }
        }
      }, debounceMs);
    } else {
      // Clear results if query is too short
      setIsTyping(false);
      onSearch('');
    }
  };

  // Handle clear button
  const handleClear = () => {
    setQuery('');
    setError('');
    setIsTyping(false);
    onSearch('');
    onClear();
  };

  // Handle form submission (Enter key)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.length < 3) {
      setError('Please enter at least 3 characters');
      setIsTyping(false);
      onClear();
      return;
    }

    try {
      const validatedQuery = SearchQuerySchema.parse({ query });
      setError('');
      onSearch(validatedQuery.query);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.issues[0];
        setError(firstError.message);
      }
    }
  };

  // Handle key down for Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Show validation hint when user has typed but not enough characters
  const showValidationHint = query.length > 0 && query.length < 3 && !isTyping;

  return (
    <div className={cn('w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pr-10 pl-10',
              error && 'border-destructive focus-visible:border-destructive',
              'transition-colors duration-200',
            )}
            aria-label="Search for cosmetic products"
            aria-describedby={error ? 'search-error' : undefined}
            aria-invalid={!!error}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={disabled}
              className="hover:bg-muted absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Validation hint/error message */}
        {(showValidationHint || error) && (
          <div
            id="search-error"
            className={cn('mt-2 text-sm', error ? 'text-destructive' : 'text-muted-foreground')}
            role="alert"
            aria-live="polite"
          >
            {error || 'Please enter at least 3 characters'}
          </div>
        )}

        {/* Loading indicator */}
        {isTyping && (
          <div className="text-muted-foreground mt-2 text-sm" aria-live="polite">
            <span className="inline-flex items-center gap-2">
              <div className="border-muted-foreground h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
              Searching...
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
