import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.pact.test.ts'],
  transform: { '^.+\\.ts$': '@swc/jest' },
};

export default config;
