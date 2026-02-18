import type { Config } from 'jest';
import { baseJestConfig } from 'nhs-notify-web-template-management-utils';

const config: Config = {
  ...baseJestConfig,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    'version.ts'
  ],
};

export default config;
