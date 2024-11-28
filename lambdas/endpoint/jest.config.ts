module.exports = {
  transform: { '\\.ts$': '@swc/jest' },
  testPathIgnorePatterns: ['logger.ts', 'schema-for.ts', 'src/app/index.ts'],
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -10,
    },
  },
  collectCoverageFrom: ['src/**/*.ts*'],
  moduleNameMapper: {
    '^@templates(.*)$': '<rootDir>/src/templates/$1',
    '^@utils(.*)$': '<rootDir>/src/utils/$1',
  },
};
