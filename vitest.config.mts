import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Backend-focused test run (API, lib, etc.)
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/app/api/**/*.{test,spec}.ts',
      'src/lib/**/*.{test,spec}.ts',
    ],
    exclude: ['node_modules/**/*', 'dist/**/*', 'build/**/*', 'src/components/**/*', 'src/hooks/**/*'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
