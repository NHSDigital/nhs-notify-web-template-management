import { baseJestConfig } from 'nhs-notify-web-template-management-utils';

const jestConfig = {
  ...baseJestConfig,
  testEnvironment: 'node',
};

export default jestConfig;
