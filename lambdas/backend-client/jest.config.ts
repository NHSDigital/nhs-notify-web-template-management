import type { Config } from 'jest';
import { baseJestConfig } from 'nhs-notify-web-template-management-utils';

const config: Config = {
  ...baseJestConfig,
  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
  ],
};

export default config;
