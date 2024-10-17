const { performCheck } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
  reviewNHSAppTemplatePage,
  reviewNHSAppTemplateErrorPage,
  submitNHSAppTemplatePage,
  createTextMessageTemplatePage,
  createTextMessageTemplateErrorPage,
  reviewTextMessageTemplatePage,
  reviewTextMessageTemplateErrorPage,
  submitTextMessageTemplatePage,
  textMessageTemplateSubmittedPage,
  NHSAppTemplateSubmittedPage,
} = require('./actions');

const baseUrl = 'http://localhost:3000/templates';
const startUrl = 'http://localhost:3000/templates/create-and-submit-templates';

module.exports = {
  urls: [
    performCheck({ url: 'http://localhost:3000/some-404', name: '404-test' }),
    performCheck({ url: startUrl, name: 'landing-page' }),
    performCheck(chooseATemplatePage('http://localhost:3000/templates/auth?redirect=%2Fcreate-and-submit-templates')),
    performCheck(chooseATemplatePageError(startUrl)),
    performCheck(createNHSAppTemplatePage(startUrl)),
    performCheck(createNHSAppTemplateErrorPage(startUrl)),
    performCheck(reviewNHSAppTemplatePage(startUrl)),
    performCheck(reviewNHSAppTemplateErrorPage(startUrl)),
    performCheck(submitNHSAppTemplatePage(startUrl)),
    performCheck(NHSAppTemplateSubmittedPage(startUrl)),
    performCheck(createTextMessageTemplatePage(startUrl)),
    performCheck(createTextMessageTemplateErrorPage(startUrl)),
    performCheck(reviewTextMessageTemplatePage(startUrl)),
    performCheck(reviewTextMessageTemplateErrorPage(startUrl)),
    performCheck(submitTextMessageTemplatePage(startUrl)),
    performCheck(textMessageTemplateSubmittedPage(startUrl)),
    performCheck({ url: `${baseUrl}/invalid-session`, name: 'invalid-session'}),
    performCheck({ url: `${baseUrl}/testing/email-template.html`, name: 'email-template'}),
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

