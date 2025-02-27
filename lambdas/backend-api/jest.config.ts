import { baseJestConfig } from 'nhs-notify-web-template-management-utils';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const moduleNameMapperDefaults = pathsToModuleNameMapper(
  compilerOptions.paths,
  {
    prefix: '<rootDir>/',
  }
);

const jestConfig = {
  ...baseJestConfig,
  coveragePathIgnorePatterns: ['create-letter.ts'],
  moduleNameMapper: moduleNameMapperDefaults,
  testEnvironment: 'node',
};

export default jestConfig;
