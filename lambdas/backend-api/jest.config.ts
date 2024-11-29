module.exports = {
  transform: { '\\.ts$': '@swc/jest' },
  testPathIgnorePatterns: ['logger.ts', 'schema-for.ts', './src/index.ts'],
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -10,
    },
    // Remove after CCM-7409
    'src/index.ts': {
      branches: 70,
      functions: 100,
      lines: 90,
      statements: -10,
    },
  },
  collectCoverageFrom: ['src/**/*.ts*'],
  moduleNameMapper: {
    '^@backend-api/templates(.*)$': '<rootDir>/src/templates/$1',
    '^@backend-api/utils(.*)$': '<rootDir>/src/utils/$1',
  },
};
