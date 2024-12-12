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
  reviewEmailTemplatePage,
  reviewEmailTemplateErrorPage,
  createTextMessageTemplatePage,
  createTextMessageTemplateErrorPage,
  reviewTextMessageTemplatePage,
  reviewTextMessageTemplateErrorPage,
  submitTextMessageTemplatePage,
  textMessageTemplateSubmittedPage,
  submitEmailTemplatePage,
  emailTemplateSubmittedPage,
  NhsAppTemplateSubmittedPage,
  manageTemplatesPage,
} = require('./actions');

const baseUrl = 'http://localhost:3000/templates';
const chooseTemplateUrl = `${baseUrl}/choose-a-template-type`;
const startUrl = 'http://localhost:3000/templates/create-and-submit-templates';
const manageTemplatesUrl = `${baseUrl}/manage-templates`;

module.exports = {
  urls: [
    performCheck({ url: 'http://localhost:3000/some-404', name: '404-test' }),
    performCheck({ url: startUrl, name: 'landing-page' }),

    //My Messages Templates
    performCheck(manageTemplatesPage(manageTemplatesUrl)),

    // Choose a template journey
    performCheck(chooseATemplatePage(chooseTemplateUrl)),
    performCheck(chooseATemplatePageError(chooseTemplateUrl)),

    // NHS App journey
    performCheck(createNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(createNHSAppTemplateErrorPage(chooseTemplateUrl)),
    performCheck(reviewNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(reviewNHSAppTemplateErrorPage(chooseTemplateUrl)),
    performCheck(submitNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(NhsAppTemplateSubmittedPage(chooseTemplateUrl)),

    // Text message journey
    performCheck(createTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(createTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(reviewTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(reviewTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(submitTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(textMessageTemplateSubmittedPage(chooseTemplateUrl)),

    // Email journey
    performCheck(createEmailTemplatePage(chooseTemplateUrl)),
    performCheck(createEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(reviewEmailTemplatePage(chooseTemplateUrl)),
    performCheck(reviewEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(submitEmailTemplatePage(chooseTemplateUrl)),
    performCheck(emailTemplateSubmittedPage(chooseTemplateUrl)),

    performCheck({ url: `${baseUrl}/invalid-template`, name: 'invalid-template'}),
    performCheck({ url: `${baseUrl}/testing/email-template.html`, name: 'email-template'})
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

