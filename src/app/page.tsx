'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchInterface } from '@/components/search';
import { Product } from '@/types/product';
import { ErrorBoundaryWrapper } from '@/components/ui/error-boundary';

export default function Home() {
  const handleProductSelect = (product: Product) => {
    // Could navigate to product detail page or show modal
    console.log('Selected product:', product);
  };

  return (
    <ErrorBoundaryWrapper>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
        >
          Skip to main content
        </a>

        {/* Header */}
        <Header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" />

        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 container mx-auto px-4 py-6 sm:py-8 lg:py-12"
          role="main"
          aria-label="Product safety search"
        >
          {/* Hero Section */}
          <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
            <h1 className="mb-3 sm:mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
              Check Product Safety
            </h1>
            <p className="mx-auto max-w-2xl lg:max-w-3xl text-sm text-muted-foreground sm:text-base md:text-lg lg:text-xl px-4 leading-relaxed">
              Search for cosmetic products to check their safety status, understand risks, 
              and discover safer alternatives from trusted sources.
            </p>
          </div>

          {/* Search Interface */}
          <div className="mx-auto max-w-2xl lg:max-w-4xl px-2 sm:px-4 lg:px-0">
            <SearchInterface 
              onProductSelect={handleProductSelect}
              className="w-full"
            />
          </div>

          {/* Features Section */}
          <section 
            className="mt-12 sm:mt-16 lg:mt-20"
            aria-labelledby="features-heading"
          >
            <h2 id="features-heading" className="sr-only">
              Key Features
            </h2>
            <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 px-2 sm:px-4 lg:px-0">
              <div className="text-center p-4 sm:p-6 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get instant safety status with color-coded indicators for approved, cancelled, or unknown products.
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Understand why products were cancelled and learn about potential risks and safety concerns.
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 rounded-lg hover:bg-muted/50 transition-colors md:col-span-2 lg:col-span-1">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Discover approved alternative products from trusted brands when safer options are needed.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer className="border-t bg-muted/50" />
      </div>
    </ErrorBoundaryWrapper>
  );
}
