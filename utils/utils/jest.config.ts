import type { Config } from 'jest';

export const baseJestConfig: Config = {
  preset: 'ts-jest',

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: './.reports/unit/coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'babel',

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -10,
    },
  },

  collectCoverageFrom: ['src/**/*.{ts,tsx}'],

  coveragePathIgnorePatterns: [
    '/__tests__/',
    'config.ts',
    'container.ts',
    'jest.config.ts',
    '.types.ts',
    '.d.ts',
  ],

  transform: { '^.+\\.ts$': '@swc/jest' },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],

  // Use this configuration option to add custom reporters to Jest
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: './.reports/unit/test-report.html',
        includeFailureMsg: true,
      },
    ],
  ],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
};

const utilsJestConfig = {
  ...baseJestConfig,

  testEnvironment: 'node',

  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    'zod-validators.ts',
  ],
};

export default utilsJestConfig;
