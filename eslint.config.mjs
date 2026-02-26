// ESLint flat config for Next.js + TypeScript
// KNOWN ISSUE: eslint-config-next's FlatCompat has circular reference with react plugin
// Using minimal config until eslint-config-next@16.2+ releases native flat config support
// TypeScript provides type checking; this config provides basic ignores

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'playwright-report/**',
      '*.config.js',
      '*.config.mjs',
      '.history/**',
    ],
  },
  // TODO: Add typescript-eslint when pnpm store is resolved
  // See: https://github.com/vercel/next.js/issues/64409
];
