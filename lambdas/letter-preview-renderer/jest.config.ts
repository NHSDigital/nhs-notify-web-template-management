import type { Config } from 'jest';
import { baseJestConfig } from 'nhs-notify-web-template-management-utils'; // eslint-disable-line no-restricted-exports

const config: Config = {
  ...baseJestConfig,
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    'letter-preview-renderer.ts',
    'container.ts',
    'config.ts',
  ],
};

export default config;
