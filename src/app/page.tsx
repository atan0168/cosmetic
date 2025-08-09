'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchInterface } from '@/components/search';
import { Product } from '@/types/product';
import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    // Could navigate to product detail page or show modal
    console.log('Selected product:', product);
  };

  return (
    <ErrorBoundaryWrapper>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <Header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" />

        {/* Main Content */}
        <main 
          className="flex-1 container mx-auto px-4 py-8"
          role="main"
          aria-label="Product safety search"
        >
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Check Product Safety
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
              Search for cosmetic products to check their safety status, understand risks, 
              and discover safer alternatives from trusted sources.
            </p>
          </div>

          {/* Search Interface */}
          <div className="mx-auto max-w-4xl">
            <SearchInterface 
              onProductSelect={handleProductSelect}
              className="w-full"
            />
          </div>

          {/* Features Section */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Safety Status</h3>
              <p className="text-sm text-muted-foreground">
                Get instant safety status with color-coded indicators for approved, cancelled, or unknown products.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Detailed Information</h3>
              <p className="text-sm text-muted-foreground">
                Understand why products were cancelled and learn about potential risks and safety concerns.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Safer Alternatives</h3>
              <p className="text-sm text-muted-foreground">
                Discover approved alternative products from trusted brands when safer options are needed.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer className="border-t bg-muted/50" />
      </div>
    </ErrorBoundaryWrapper>
  );
}
