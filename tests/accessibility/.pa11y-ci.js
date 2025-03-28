const { readFileSync } = require('node:fs');
const { performCheck } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
  previewNHSAppTemplatePage,
  previewNHSAppTemplateErrorPage,
  submitNHSAppTemplatePage,
  createEmailTemplatePage,
  createLetterTemplatePage,
  createEmailTemplateErrorPage,
  previewEmailTemplatePage,
  previewEmailTemplateErrorPage,
  previewLetterTemplatePage,
  previewLetterTemplateErrorPage,
  createTextMessageTemplatePage,
  createTextMessageTemplateErrorPage,
  letterTemplateSubmittedPage,
  previewTextMessageTemplatePage,
  previewTextMessageTemplateErrorPage,
  submitTextMessageTemplatePage,
  textMessageTemplateSubmittedPage,
  submitEmailTemplatePage,
  submitLetterTemplatePage,
  emailTemplateSubmittedPage,
  nhsAppTemplateSubmittedPage,
  manageTemplatesPage,
  viewNotYetSubmittedEmailTemplatePage,
  viewNotYetSubmittedNHSAppTemplatePage,
  viewNotYetSubmittedTextMessageTemplatePage,
  viewNotYetSubmittedLetterTemplatePage,
  viewSubmittedEmailTemplatePage,
  viewSubmittedNHSAppTemplatePage,
  viewSubmittedTextMessageTemplatePage,
  viewSubmittedLetterTemplatePage,
  copyTemplatePage,
  signInPageActions,
} = require('./actions');

const baseUrl = 'http://localhost:3000/templates';
const chooseTemplateUrl = `${baseUrl}/choose-a-template-type`;
const startUrl = 'http://localhost:3000/templates/create-and-submit-templates';
const manageTemplatesUrl = `${baseUrl}/manage-templates`;

const { templateIds } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

module.exports = {
  urls: [
    performCheck({ url: 'http://localhost:3000/some-404', name: '404-test' }),
    performCheck({ url: startUrl, name: 'landing-page' }),

    //My Messages Templates
    performCheck(manageTemplatesPage(manageTemplatesUrl)),
    performCheck(copyTemplatePage(chooseTemplateUrl)),

    // Choose a template journey
    performCheck(chooseATemplatePage(chooseTemplateUrl)),
    performCheck(chooseATemplatePageError(chooseTemplateUrl)),

    // NHS App journey
    performCheck(createNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(createNHSAppTemplateErrorPage(chooseTemplateUrl)),
    performCheck(previewNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(previewNHSAppTemplateErrorPage(chooseTemplateUrl)),
    performCheck(viewNotYetSubmittedNHSAppTemplatePage(manageTemplatesUrl)),
    performCheck(submitNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(nhsAppTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(viewSubmittedNHSAppTemplatePage(manageTemplatesUrl)),

    // Text message journey
    performCheck(createTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(createTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(previewTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(previewTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(
      viewNotYetSubmittedTextMessageTemplatePage(manageTemplatesUrl)
    ),
    performCheck(submitTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(textMessageTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(viewSubmittedTextMessageTemplatePage(manageTemplatesUrl)),

    // Email journey
    performCheck(createEmailTemplatePage(chooseTemplateUrl)),
    performCheck(createEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(previewEmailTemplatePage(chooseTemplateUrl)),
    performCheck(previewEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(viewNotYetSubmittedEmailTemplatePage(manageTemplatesUrl)),
    performCheck(submitEmailTemplatePage(chooseTemplateUrl)),
    performCheck(emailTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(viewSubmittedEmailTemplatePage(manageTemplatesUrl)),

    // Letter Journey
    performCheck(createLetterTemplatePage(chooseTemplateUrl)),
    performCheck(
      previewLetterTemplatePage(
        `${baseUrl}/preview-letter-template/${templateIds['pa11y-letter-pending-virus-check']}`
      )
    ),
    performCheck(
      previewLetterTemplateErrorPage(
        `${baseUrl}/preview-letter-template/${templateIds['pa11y-letter-pending-virus-check']}`
      )
    ),
    performCheck(viewNotYetSubmittedLetterTemplatePage(manageTemplatesUrl)),
    performCheck(
      submitLetterTemplatePage(
        `${baseUrl}/preview-letter-template/${templateIds['pa11y-letter-passed-virus-check']}`
      )
    ),
    performCheck(
      letterTemplateSubmittedPage(
        `${baseUrl}/preview-letter-template/${templateIds['pa11y-letter-passed-virus-check']}`
      )
    ),
    performCheck(viewSubmittedLetterTemplatePage(manageTemplatesUrl)),

    // Non-existent template
    performCheck({
      url: `${baseUrl}/invalid-template`,
      actions: [...signInPageActions, 'wait for h1 to be visible'],
      name: 'invalid-template',
    }),
  ],
  defaults: {
    reporters: [
      'cli',
      [
        'pa11y-ci-reporter-html',
        {
          destination: './.reports/accessibility',
          includeZeroIssues: true,
        },
      ],
    ],
    rules: ['Principle1.Guideline1_3.1_3_1_AAA'],
    chromeLaunchConfig: {
      args: ['--no-sandbox'],
    },
    standard: 'WCAG2AA',
    agent: 'pa11y',
  },
};
