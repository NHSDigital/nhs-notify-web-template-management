import type { Config } from 'jest';
import { baseJestConfig } from 'nhs-notify-web-template-management-utils';

const config: Config = {
  ...baseJestConfig,
  testEnvironment: 'node',
  moduleNameMapper: {
    '@nhsdigital/nhs-notify-event-schemas-template-management$':
      '<rootDir>/../../packages/event-schemas/src',
  },
  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    'sqs-handler.ts',
    'event-publisher.ts'
  ],
};

export default config;
