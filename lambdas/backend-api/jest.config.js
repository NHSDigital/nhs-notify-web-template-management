module.exports = {
  transform: { '\\.ts$': '@swc/jest' },
  testPathIgnorePatterns: ['logger.ts', 'schema-for.ts', '.snap'],
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -10,
    },
  },
  collectCoverageFrom: ['src/**/*.ts'],
  moduleNameMapper: {
    '^@backend-api/templates(.*)$': '<rootDir>/src/templates/$1',
    '^@backend-api/utils(.*)$': '<rootDir>/src/utils/$1',
  },
};
