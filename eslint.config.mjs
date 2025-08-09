import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js defaults
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Disable rules that conflict with Prettier
  ...compat.extends('prettier'),
];

export default eslintConfig;
