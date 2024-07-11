
const { goToCreateNhsAppTemplatePage } = require('./actions/create-nhs-app-template.action');

const getHeaders = () => {
  const headers = new Map();

  if (process.env.BASIC_AUTH) {
    headers.set('Authorization', `Basic ${process.env.BASIC_AUTH}`);
  }

  return Object.fromEntries(headers.entries());
}

const getUrls = () => {
  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

  return [
    baseUrl,
    `${baseUrl}/create-template`,
    goToCreateNhsAppTemplatePage(`${baseUrl}/create-template`)
  ];
}

module.exports = {
  defaults: {
    headers: getHeaders(),
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
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    },
    rules: [
      'Principle1.Guideline1_3.1_3_1_AAA',
    ],
    useIncognitoBrowserContext: false,
    standard: 'WCAG2AA', //'WCAG2AAA'
    userAgent: 'pa11y-ci',
    concurrency: 5,
  },
  urls: getUrls()
};
