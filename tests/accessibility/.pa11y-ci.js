const { readFileSync } = require('node:fs');
const { performCheck } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
  copyTemplatePage,
  createEmailTemplateErrorPage,
  createEmailTemplatePage,
  createLetterTemplatePage,
  createNHSAppTemplateErrorPage,
  createNHSAppTemplatePage,
  createTextMessageTemplateErrorPage,
  createTextMessageTemplatePage,
  emailTemplateSubmittedPage,
  letterTemplateSubmittedPage,
  messageTemplatesPage,
  nhsAppTemplateSubmittedPage,
  previewEmailTemplateErrorPage,
  previewEmailTemplatePage,
  previewLetterTemplatePage,
  previewNHSAppTemplateErrorPage,
  previewNHSAppTemplatePage,
  previewSubmittedEmailTemplatePage,
  previewSubmittedLetterTemplatePage,
  previewSubmittedNHSAppTemplatePage,
  previewSubmittedTextMessageTemplatePage,
  previewTextMessageTemplateErrorPage,
  previewTextMessageTemplatePage,
  signInPageActions,
  submitEmailTemplatePage,
  submitLetterTemplatePage,
  submitNHSAppTemplatePage,
  submitTextMessageTemplatePage,
  textMessageTemplateSubmittedPage,
  viewNotYetSubmittedEmailTemplatePage,
  viewNotYetSubmittedLetterTemplatePage,
  viewNotYetSubmittedNHSAppTemplatePage,
  viewNotYetSubmittedTextMessageTemplatePage,
} = require('./actions');

const baseUrl = 'http://localhost:3000/templates';
const chooseTemplateUrl = `${baseUrl}/choose-a-template-type`;
const startUrl = 'http://localhost:3000/templates/create-and-submit-templates';
const messageTemplatesUrl = `${baseUrl}/message-templates`;

const { templateIds } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

module.exports = {
  urls: [
    performCheck({ url: 'http://localhost:3000/some-404', name: '404-test' }),
    performCheck({ url: startUrl, name: 'landing-page' }),

    //My Messages Templates
    performCheck(messageTemplatesPage(messageTemplatesUrl)),
    performCheck(copyTemplatePage(chooseTemplateUrl)),

    // Choose a template journey
    performCheck(chooseATemplatePage(chooseTemplateUrl)),
    performCheck(chooseATemplatePageError(chooseTemplateUrl)),

    // NHS App journey
    performCheck(createNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(createNHSAppTemplateErrorPage(chooseTemplateUrl)),
    performCheck(previewNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(previewNHSAppTemplateErrorPage(chooseTemplateUrl)),
    performCheck(viewNotYetSubmittedNHSAppTemplatePage(messageTemplatesUrl)),
    performCheck(submitNHSAppTemplatePage(chooseTemplateUrl)),
    performCheck(nhsAppTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(previewSubmittedNHSAppTemplatePage(messageTemplatesUrl)),

    // Text message journey
    performCheck(createTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(createTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(previewTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(previewTextMessageTemplateErrorPage(chooseTemplateUrl)),
    performCheck(
      viewNotYetSubmittedTextMessageTemplatePage(messageTemplatesUrl)
    ),
    performCheck(submitTextMessageTemplatePage(chooseTemplateUrl)),
    performCheck(textMessageTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(previewSubmittedTextMessageTemplatePage(messageTemplatesUrl)),

    // Email journey
    performCheck(createEmailTemplatePage(chooseTemplateUrl)),
    performCheck(createEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(previewEmailTemplatePage(chooseTemplateUrl)),
    performCheck(previewEmailTemplateErrorPage(chooseTemplateUrl)),
    performCheck(viewNotYetSubmittedEmailTemplatePage(messageTemplatesUrl)),
    performCheck(submitEmailTemplatePage(chooseTemplateUrl)),
    performCheck(emailTemplateSubmittedPage(chooseTemplateUrl)),
    performCheck(previewSubmittedEmailTemplatePage(messageTemplatesUrl)),

    // Letter Journey
    performCheck(createLetterTemplatePage(chooseTemplateUrl)),
    performCheck(
      previewLetterTemplatePage(
        `${baseUrl}/preview-letter-template/${templateIds['pa11y-letter-pending-virus-check']}`
      )
    ),
    performCheck(viewNotYetSubmittedLetterTemplatePage(messageTemplatesUrl)),
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
    performCheck(previewSubmittedLetterTemplatePage(messageTemplatesUrl)),

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
