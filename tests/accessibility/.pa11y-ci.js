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
  viewNotYetSubmittedEmailTemplatePage,
  viewNotYetSubmittedNHSAppTemplatePage,
  viewNotYetSubmittedTextMessageTemplatePage,
  viewSubmittedEmailTemplatePage,
  viewSubmittedNHSAppTemplatePage,
  viewSubmittedTextMessageTemplatePage,
  signInPageActions,
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
    performCheck(viewNotYetSubmittedNHSAppTemplatePage(manageTemplatesUrl)),
    performCheck(submitNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(NhsAppTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(viewSubmittedNHSAppTemplatePage(manageTemplatesUrl)),

    // Text message journey
    performCheck(createTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(createTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(reviewTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(reviewTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(viewNotYetSubmittedTextMessageTemplatePage(manageTemplatesUrl)),
    performCheck(submitTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(textMessageTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(viewSubmittedTextMessageTemplatePage(manageTemplatesUrl)),

    // Email journey
    performCheck(createEmailTemplatePage(chooseTemplateUrl)),
    performCheck(createEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(reviewEmailTemplatePage(chooseTemplateUrl)),
    performCheck(reviewEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(viewNotYetSubmittedEmailTemplatePage(manageTemplatesUrl)),
    performCheck(submitEmailTemplatePage(chooseTemplateUrl)),
    performCheck(emailTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(viewSubmittedEmailTemplatePage(manageTemplatesUrl)),

    performCheck({ url: `${baseUrl}/invalid-template`, actions: [...signInPageActions, 'wait for h1 to be visible'], name: 'invalid-template'}),
    performCheck({ url: `${baseUrl}/testing/email-template.html`, actions: [...signInPageActions, 'wait for table to be visible'], name: 'email-template'})
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

