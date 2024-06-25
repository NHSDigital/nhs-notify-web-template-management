/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: './.reports/unit/coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -10,
    },
  },

  // Use this configuration option to add custom reporters to Jest
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: './.reports/unit/test-report.html',
        includeFailureMsg: true,
      },
    ],
  ],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // Set the absolute path for imports
  moduleNameMapper: {
    // ...
    '^@/(.*)$': '<rootDir>/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// https://nextjs.org/docs/app/building-your-application/testing/jest
export default createJestConfig(config);
