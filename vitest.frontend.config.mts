import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: ['src/components/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup-frontend.ts'],
    testTimeout: 10000, // 10 second timeout for individual tests
    hookTimeout: 5000, // 5 second timeout for hooks (beforeEach, afterEach)
    teardownTimeout: 5000, // 5 second timeout for cleanup
  },
});
