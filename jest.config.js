const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',

    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// three >= 0.186 ships only ESM behind its CJS entry, so Jest must transform it.
// next/jest injects several node_modules ignore patterns (including a pnpm-specific one) that
// would skip three, so keep only the CSS-module pattern and add one that lets three, geist and
// next's client chunks through, matching the originals' intent.
const TRANSFORM_ALLOWLIST = 'three|geist|next/dist/client|next/dist/shared/lib|next/src/client|next/src/shared/lib'

module.exports = async () => {
  const resolved = await createJestConfig(customJestConfig)()
  resolved.transformIgnorePatterns = [
    `/node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(?:${TRANSFORM_ALLOWLIST})/)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  return resolved
}
