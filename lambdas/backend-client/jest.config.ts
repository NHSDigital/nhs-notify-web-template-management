module.exports = {
  transform: { '\\.ts$': '@swc/jest' },
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
};
