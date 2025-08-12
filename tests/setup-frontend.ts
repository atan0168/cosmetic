// Test setup file for frontend component tests (no database required)
import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Set up environment variables
// @ts-expect-error - This is a workaround for Vitest not recognizing process.env in this context
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
// Signal test environment
process.env.VITEST = 'true';

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up DOM after each test
  cleanup();
  // Clear all timers but keep fake timers active for consistency
  vi.clearAllTimers();
  // Clear all mocks after each test
  vi.clearAllMocks();
  // Reset all modules to prevent state leakage
  vi.resetModules();
});
