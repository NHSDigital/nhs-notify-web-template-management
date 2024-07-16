const { performCheck } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
  reviewNHSAppTemplatePage,
  reviewNHSAppTemplateErrorPage,
} = require('./actions');

const baseUrl = 'http://localhost:3000/templates';

module.exports = {
  urls: [
    performCheck({ url: 'http://localhost:3000/some-404', name: '404-test' }),
    performCheck({ url: baseUrl, name: 'landing-page' }),
    performCheck(chooseATemplatePage(baseUrl)),
    performCheck(chooseATemplatePageError(baseUrl)),
    performCheck(createNHSAppTemplatePage(baseUrl)),
    performCheck(createNHSAppTemplateErrorPage(baseUrl)),
    performCheck(reviewNHSAppTemplatePage(baseUrl)),
    performCheck(reviewNHSAppTemplateErrorPage(baseUrl)),
  ],
  defaults: {
    reporters: [
      'cli',
      [
        'pa11y-ci-reporter-html',
        {
          destination: './.reports/accessibility',
          includeZeroIssues: true
        }
      ],
    ],
    rules: [
      'Principle1.Guideline1_3.1_3_1_AAA',
    ],
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    },
    standard: 'WCAG2AA',
    agent: 'pa11y',
  }
};

