import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RiskIndicator } from '../risk-indicator';
import { RiskLevel } from '@/types/product';

describe('RiskIndicator', () => {
  it('renders safe risk level correctly', () => {
    render(<RiskIndicator riskLevel={RiskLevel.SAFE} />);

    expect(screen.getByText('SAFE')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Product is safe to use');
    expect(screen.getByRole('status')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders unsafe risk level correctly', () => {
    render(<RiskIndicator riskLevel={RiskLevel.UNSAFE} />);

    expect(screen.getByText('UNSAFE')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Product has been cancelled due to safety concerns',
    );
    expect(screen.getByRole('status')).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders unknown risk level correctly', () => {
    render(<RiskIndicator riskLevel={RiskLevel.UNKNOWN} />);

    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Product safety status is unknown',
    );
    expect(screen.getByRole('status')).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('applies custom className', () => {
    render(<RiskIndicator riskLevel={RiskLevel.SAFE} className="custom-class" />);

    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<RiskIndicator riskLevel={RiskLevel.SAFE} />);

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('role', 'status');
    expect(indicator).toHaveAttribute('aria-label');

    // Icon should be hidden from screen readers
    const icon = indicator.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
