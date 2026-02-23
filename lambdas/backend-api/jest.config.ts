import { baseJestConfig } from 'nhs-notify-web-template-management-utils';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import { Config } from 'jest';

const moduleNameMapperDefaults = pathsToModuleNameMapper(
  compilerOptions.paths,
  {
    prefix: '<rootDir>/',
  }
);

const jestConfig: Config = {
  ...baseJestConfig,
  moduleNameMapper: moduleNameMapperDefaults,
  testEnvironment: 'node',
  prettierPath: null,
  coveragePathIgnorePatterns: [
    ...(baseJestConfig.coveragePathIgnorePatterns ?? []),
    '/test-utils/',
    'proofing-queue.ts',
    'src/container',
    '/src/[^/]+\\.ts$',
  ],
  transformIgnorePatterns: ['node_modules/(?!pdfjs-dist)'],
  transform: {
    '^.+\\.(mjs)$': 'babel-jest',
  },
};

export default jestConfig;
