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
      <div className="bg-background flex min-h-screen flex-col">
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          Skip to main content
        </a>

        {/* Header */}
        <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />

        {/* Main Content */}
        <main
          id="main-content"
          className="container mx-auto flex-1 px-4 py-6 sm:py-8 lg:py-12"
          role="main"
          aria-label="Product safety search"
        >
          {/* Hero Section */}
          <div className="mb-6 text-center sm:mb-8 lg:mb-12">
            <h1 className="text-foreground mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Check Product Safety
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl px-4 text-sm leading-relaxed sm:text-base md:text-lg lg:max-w-3xl lg:text-xl">
              Search for cosmetic products to check their safety status, understand risks, and
              discover safer alternatives from trusted sources.
            </p>
          </div>

          {/* Search Interface */}
          <div className="mx-auto max-w-2xl px-2 sm:px-4 lg:max-w-4xl lg:px-0">
            <SearchInterface onProductSelect={handleProductSelect} className="w-full" />
          </div>

          {/* Features Section */}
          <section className="mt-12 sm:mt-16 lg:mt-20" aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">
              Key Features
            </h2>
            <div className="grid gap-4 px-2 sm:gap-6 sm:px-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:px-0">
              <div className="hover:bg-muted/50 rounded-lg p-4 text-center transition-colors sm:p-6">
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
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Get instant safety status with color-coded indicators for approved, cancelled, or
                  unknown products.
                </p>
              </div>

              <div className="hover:bg-muted/50 rounded-lg p-4 text-center transition-colors sm:p-6">
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
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Understand why products were cancelled and learn about potential risks and safety
                  concerns.
                </p>
              </div>

              <div className="hover:bg-muted/50 rounded-lg p-4 text-center transition-colors sm:p-6 md:col-span-2 lg:col-span-1">
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
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Discover approved alternative products from trusted brands when safer options are
                  needed.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer className="bg-muted/50 border-t" />
      </div>
    </ErrorBoundaryWrapper>
  );
}
