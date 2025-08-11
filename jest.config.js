/** @type {import('jest').Config} */
module.exports = {
  projects: [
    // Configuration for React components (Button, Dropdown, etc.)
    {
      displayName: 'components',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'jsdom',
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testMatch: [
        '<rootDir>/packages/components/**/__test__/**/*.{test,spec}.{ts,tsx}',
        '<rootDir>/packages/components/**/*.{test,spec}.{ts,tsx}'
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            moduleResolution: 'bundler',
            target: 'es2020',
            module: 'esnext',
          }
        }],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'packages/components/**/src/**/*.{ts,tsx}',
        '!packages/components/**/src/**/*.stories.{ts,tsx}',
        '!packages/components/**/src/**/index.ts',
        '!packages/components/**/src/**/*.d.ts',
      ],
    },
    
    // Configuration for tw-theme package
    {
      displayName: 'tw-theme',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      extensionsToTreatAsEsm: ['.ts'],
      setupFilesAfterEnv: ['<rootDir>/packages/tw-theme/jest.setup.js'],
      testMatch: [
        '<rootDir>/packages/tw-theme/src/**/*.{test,spec}.{ts,tsx}'
      ],
      testPathIgnorePatterns: [
        'test-utils.ts'
      ],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          useESM: true,
          tsconfig: '<rootDir>/packages/tw-theme/tsconfig.test.json'
        }],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: [
        'packages/tw-theme/src/**/*.{ts,tsx}',
        '!packages/tw-theme/src/**/*.d.ts',
        '!packages/tw-theme/src/**/__tests__/**',
        '!packages/tw-theme/src/**/index.ts',
        '!packages/tw-theme/src/build/**',
        '!packages/tw-theme/src/**/*.config.{ts,js}',
        '!packages/tw-theme/src/**/*test-utils*',
      ],
    }
  ],
  
  // Global configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  testTimeout: 10000,
  maxWorkers: '50%',
};
