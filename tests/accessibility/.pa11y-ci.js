const { readFileSync } = require('node:fs');
const { performCheck } = require('./helpers');
const {
  chooseATemplateTypePage,
  chooseATemplateTypePageError,
  copyTemplatePage,
  createEmailTemplateErrorPage,
  createEmailTemplatePage,
  uploadLetterTemplatePage,
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
  previewLetterTemplatePageWithError,
  previewNHSAppTemplateErrorPage,
  previewNHSAppTemplatePage,
  previewSubmittedEmailTemplatePage,
  previewSubmittedLetterTemplatePage,
  previewSubmittedNHSAppTemplatePage,
  previewSubmittedTextMessageTemplatePage,
  previewTextMessageTemplateErrorPage,
  previewTextMessageTemplatePage,
  requestProofOfTemplatePage,
  signInPageActions,
  submitEmailTemplatePage,
  submitLetterTemplatePage,
  submitNHSAppTemplatePage,
  submitTextMessageTemplatePage,
  textMessageTemplateSubmittedPage,
  viewAvailableProofsForLetterTemplatePage,
  viewNotYetSubmittedEmailTemplatePage,
  viewNotYetSubmittedLetterTemplatePage,
  viewNotYetSubmittedNHSAppTemplatePage,
  viewNotYetSubmittedTextMessageTemplatePage,
  waitingForProofsLetterTemplatePage,
} = require('./actions');

const baseUrl = 'http://localhost:3000/templates';
const chooseTemplateTypeUrl = `${baseUrl}/choose-a-template-type`;
const startUrl = 'http://localhost:3000/templates/create-and-submit-templates';
const messageTemplatesUrl = `${baseUrl}/message-templates`;

const { templateIds } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

function previewLetterTemplateUrl(status) {
  return `${baseUrl}/preview-letter-template/${templateIds[status]}`;
}

const allTemplates = [
  messageTemplatesPage(messageTemplatesUrl),
  copyTemplatePage(chooseTemplateTypeUrl),
];

const chooseTemplateType = [
  chooseATemplateTypePage(chooseTemplateTypeUrl),
  chooseATemplateTypePageError(chooseTemplateTypeUrl),
];

const nhsApp = [
  createNHSAppTemplatePage(chooseTemplateTypeUrl),
  createNHSAppTemplateErrorPage(chooseTemplateTypeUrl),
  previewNHSAppTemplatePage(chooseTemplateTypeUrl),
  previewNHSAppTemplateErrorPage(chooseTemplateTypeUrl),
  viewNotYetSubmittedNHSAppTemplatePage(messageTemplatesUrl),
  submitNHSAppTemplatePage(chooseTemplateTypeUrl),
  nhsAppTemplateSubmittedPage(chooseTemplateTypeUrl),
  previewSubmittedNHSAppTemplatePage(messageTemplatesUrl),
];

const sms = [
  createTextMessageTemplatePage(chooseTemplateTypeUrl),
  createTextMessageTemplateErrorPage(chooseTemplateTypeUrl),
  previewTextMessageTemplatePage(chooseTemplateTypeUrl),
  previewTextMessageTemplateErrorPage(chooseTemplateTypeUrl),
  viewNotYetSubmittedTextMessageTemplatePage(messageTemplatesUrl),
  submitTextMessageTemplatePage(chooseTemplateTypeUrl),
  textMessageTemplateSubmittedPage(chooseTemplateTypeUrl),
  previewSubmittedTextMessageTemplatePage(messageTemplatesUrl),
];

const email = [
  createEmailTemplatePage(chooseTemplateTypeUrl),
  createEmailTemplateErrorPage(chooseTemplateTypeUrl),
  previewEmailTemplatePage(chooseTemplateTypeUrl),
  previewEmailTemplateErrorPage(chooseTemplateTypeUrl),
  viewNotYetSubmittedEmailTemplatePage(messageTemplatesUrl),
  submitEmailTemplatePage(chooseTemplateTypeUrl),
  emailTemplateSubmittedPage(chooseTemplateTypeUrl),
  previewSubmittedEmailTemplatePage(messageTemplatesUrl),
];

const letters = [
  uploadLetterTemplatePage(chooseTemplateTypeUrl),
  previewLetterTemplatePage(previewLetterTemplateUrl('PENDING_UPLOAD')),
  previewLetterTemplatePageWithError(previewLetterTemplateUrl('VIRUS_SCAN_FAILED')),
  previewLetterTemplatePage(previewLetterTemplateUrl('PENDING_VALIDATION')),
  previewLetterTemplatePageWithError(previewLetterTemplateUrl('VALIDATION_FAILED')),
  viewNotYetSubmittedLetterTemplatePage(messageTemplatesUrl, templateIds.PENDING_PROOF_REQUEST),
  requestProofOfTemplatePage(previewLetterTemplateUrl('PENDING_PROOF_REQUEST')),
  waitingForProofsLetterTemplatePage(previewLetterTemplateUrl('WAITING_FOR_PROOF')),
  viewAvailableProofsForLetterTemplatePage(previewLetterTemplateUrl('PROOF_AVAILABLE')),
  submitLetterTemplatePage(previewLetterTemplateUrl('PROOF_AVAILABLE')),
  letterTemplateSubmittedPage(previewLetterTemplateUrl('PROOF_AVAILABLE')),
  previewSubmittedLetterTemplatePage(messageTemplatesUrl),
];

const landingPage = [{ url: startUrl, name: 'landing-page' }];

const errors = [
  {
    url: `${baseUrl}/invalid-template`,
    actions: [...signInPageActions, 'wait for h1 to be visible'],
    name: 'invalid-template',
  },
  {
    url: `${baseUrl}/upload-letter-template/client-id-and-campaign-id-required`,
    actions: [...signInPageActions, 'wait for h1 to be visible'],
    name: 'client-campaign-id-required',
  },
];

const userEmails = [
  {
    url: `${baseUrl}/testing/template-submitted-email.html`,
    name: 'email-template',
  },
  {
    url: `${baseUrl}/testing/proof-requested-email.html`,
    name: 'email-template',
  },
];

const allJourneys = {
  landingPage,
  allTemplates,
  chooseTemplateType,
  nhsApp,
  sms,
  email,
  letters,
  userEmails,
  errors,
};

const selectedJourney = process.env.JOURNEY && allJourneys[process.env.JOURNEY]
  ? [process.env.JOURNEY]
  : Object.keys(allJourneys);

module.exports = {
  urls: selectedJourney
    .flatMap(journey => allJourneys[journey] || [])
    .map(performCheck),
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
