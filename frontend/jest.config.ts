/* eslint-disable import/no-relative-packages */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';
import { pathsToModuleNameMapper } from 'ts-jest';
import { baseJestConfig } from 'nhs-notify-web-template-management-utils';
import { compilerOptions } from './tsconfig.json';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './src',
});

const moduleNameMapperDefaults = pathsToModuleNameMapper(
  compilerOptions.paths,
  {
    prefix: '<rootDir>/',
  }
);

const config: Config = {
  ...baseJestConfig,

  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    '.types.ts',
    'layout.tsx',
    'container.tsx',
    '.snap',
    'resource.ts',
    'backend.ts',
    'jest.config.ts',
    '.dev.tsx',
  ],

  testPathIgnorePatterns: ['/node_modules/', 'fixture', 'helpers.ts', '.build'],

  // Set the absolute path for imports
  moduleNameMapper: {
    '@/amplify_outputs.json': '<rootDir>/jestamplify_outputs.json',
    ...moduleNameMapperDefaults,
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  maxConcurrency: 3,
  maxWorkers: 3,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// https://nextjs.org/docs/app/building-your-application/testing/jest
export default createJestConfig(config);
