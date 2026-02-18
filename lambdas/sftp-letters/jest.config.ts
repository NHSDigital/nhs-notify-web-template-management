import type { Config } from 'jest';
import { baseJestConfig } from 'nhs-notify-web-template-management-utils'; // eslint-disable-line no-restricted-exports

const config: Config = {
  ...baseJestConfig,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    'src/config.ts',
    'container-poll.ts',
    'container-request-proof.ts',
    'sftp-poll',
    'sftp-request-proof.ts',
    'types.ts',
    'config-poll.ts'
  ],
};

export default config;
