
const baseUrl = process.env.BASE_URL ?? 'localhost:3000';
const { goToCreateNhsAppTemplatePage } = require('./actions/create-nhs-app-template.action');

module.exports = {
  defaults: {
    reporters: [
      'cli', // <-- this is the default reporter
      [
        'pa11y-ci-reporter-html',
        {
          destination: './.reports/accessibility',
          includeZeroIssues: true
        }
      ],
    ],
    timeout: 20000,
    wait: 2000,
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    },
    rules: [
      'Principle1.Guideline1_3.1_3_1_AAA',
    ],
    useIncognitoBrowserContext: false,
    standard: 'WCAG2AA', //'WCAG2AAA'
    userAgent: 'pa11y-ci',
    concurrency: 8,
  },
  urls: ['localhost:3000', 'localhost:3000/create-template', goToCreateNhsAppTemplatePage('localhost:3000/create-template')]
};
