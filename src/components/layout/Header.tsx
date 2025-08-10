'use client';

import { Shield, Search, Building2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={className} role="banner">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link
            href="/"
            className="text-foreground hover:text-foreground/80 focus:ring-ring flex items-center gap-2 rounded-md text-xl font-bold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:gap-3 sm:text-2xl"
            aria-label="Product Safety Insights - Home"
          >
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
              <Shield className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <span className="hidden sm:inline">Product Safety Insights</span>
            <span className="text-lg sm:hidden">PSI</span>
          </Link>

          {/* Navigation */}
          <nav role="navigation" aria-label="Main navigation">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-ring flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:gap-2 sm:px-3"
                aria-label="Search products"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
              </Link>

              {/* Separator */}
              <div className="bg-border h-4 w-px" aria-hidden="true" />

              <Link
                href="/companies"
                className="text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-ring flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:gap-2 sm:px-3"
                aria-label="View companies"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Companies</span>
              </Link>

              {/* Separator */}
              <div className="bg-border h-4 w-px" aria-hidden="true" />

              <Link
                href="/ingredients"
                className="text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-ring flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:gap-2 sm:px-3"
                aria-label="View banned ingredients"
              >
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Ingredients</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Subtitle */}
        <div className="mt-2 sm:mt-3">
          <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed sm:text-sm">
            Check cosmetic product safety status and discover safer alternatives from trusted
            sources
          </p>
        </div>
      </div>
    </header>
  );
}
