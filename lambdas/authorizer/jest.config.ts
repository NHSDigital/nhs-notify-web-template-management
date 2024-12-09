module.exports = {
  transform: { '\\.ts$': '@swc/jest' },
  testPathIgnorePatterns: ['.build' ],
  coverageDirectory: './.reports/unit/coverage',
  collectCoverageFrom: ['src/**/*.ts*'],
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: -10,
    },
  },
};
