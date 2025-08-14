'use client';

import { Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={className} role="contentinfo">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold sm:text-base">Product Safety Insights</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering consumers with reliable cosmetic product safety information and safer
              alternatives.
            </p>
          </div>

          {/* Information Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold sm:text-base">Information</h3>
            <nav aria-label="Information links">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground focus:ring-ring rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    aria-label="About our safety data sources"
                  >
                    Data Sources
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground focus:ring-ring rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    aria-label="How to use this tool"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground focus:ring-ring rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    aria-label="Frequently asked questions"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Legal Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold sm:text-base">Legal</h3>
            <nav aria-label="Legal links">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground focus:ring-ring rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    aria-label="Privacy policy"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground focus:ring-ring rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    aria-label="Terms of service"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 border-t pt-6 sm:mt-8 sm:pt-8">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground text-xs sm:text-sm">
              © {new Date().getFullYear()} Product Safety Insights. All rights reserved.
            </p>
            <div className="text-muted-foreground flex items-center gap-4 text-xs sm:text-sm">
              <span>Data updated regularly from official sources</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:mt-6 sm:p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-xs leading-relaxed text-amber-800 sm:text-sm dark:text-amber-200">
            <strong>Disclaimer:</strong> This tool provides information based on official cosmetic
            notification databases. Always consult with healthcare professionals for specific safety
            concerns. Product safety status may change over time.
          </p>
        </div>
      </div>
    </footer>
  );
}
