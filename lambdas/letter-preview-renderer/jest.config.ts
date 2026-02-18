import type { Config } from 'jest';
import { baseJestConfig } from 'nhs-notify-web-template-management-utils'; // eslint-disable-line no-restricted-exports

const config: Config = {
  ...baseJestConfig,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    'config.ts',
    'container.ts',
    'letter-preview-renderer.ts',
  ],
};

export default config;
