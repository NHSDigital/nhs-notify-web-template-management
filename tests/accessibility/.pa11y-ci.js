const { performCheck } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
  reviewNHSAppTemplatePage,
  reviewNHSAppTemplateErrorPage,
  submitNHSAppTemplatePage,
  createEmailTemplatePage,
  createEmailTemplateErrorPage,
} = require('./actions');

const baseUrl = 'http://localhost:3000/templates';
const startUrl = 'http://localhost:3000/templates/create-and-submit-templates';

module.exports = {
  urls: [
    performCheck({ url: 'http://localhost:3000/some-404', name: '404-test' }),
    performCheck({ url: startUrl, name: 'landing-page' }),
    performCheck(chooseATemplatePage(baseUrl)),
    performCheck(chooseATemplatePageError(baseUrl)),

    performCheck(createNHSAppTemplatePage(baseUrl)),
    performCheck(createNHSAppTemplateErrorPage(baseUrl)),
    performCheck(reviewNHSAppTemplatePage(baseUrl)),
    performCheck(reviewNHSAppTemplateErrorPage(baseUrl)),
    performCheck(submitNHSAppTemplatePage(baseUrl)),

    performCheck(createEmailTemplatePage(baseUrl)),
    performCheck(createEmailTemplateErrorPage(baseUrl)),
    performCheck({ url: `${baseUrl}/invalid-session`, name: 'invalid-session'}),
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

