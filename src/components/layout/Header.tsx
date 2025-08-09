'use client';

import { Shield, Search } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={className} role="banner">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link 
            href="/" 
            className="flex items-center gap-3 text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            aria-label="Product Safety Insights - Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="hidden sm:inline">Product Safety Insights</span>
            <span className="sm:hidden">PSI</span>
          </Link>

          {/* Navigation */}
          <nav role="navigation" aria-label="Main navigation">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Search products"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Subtitle */}
        <div className="mt-2">
          <p className="text-sm text-muted-foreground max-w-2xl">
            Check cosmetic product safety status and discover safer alternatives from trusted sources
          </p>
        </div>
      </div>
    </header>
  );
}