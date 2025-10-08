const { readFileSync } = require('node:fs');
const { performCheck } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
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
  messagePlansPage,
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
const chooseTemplateUrl = `${baseUrl}/choose-a-template-type`;
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
  copyTemplatePage(chooseTemplateUrl),
];

const chooseTemplate = [
  chooseATemplatePage(chooseTemplateUrl),
  chooseATemplatePageError(chooseTemplateUrl),
];

const nhsApp = [
  createNHSAppTemplatePage(chooseTemplateUrl),
  createNHSAppTemplateErrorPage(chooseTemplateUrl),
  previewNHSAppTemplatePage(chooseTemplateUrl),
  previewNHSAppTemplateErrorPage(chooseTemplateUrl),
  viewNotYetSubmittedNHSAppTemplatePage(messageTemplatesUrl),
  submitNHSAppTemplatePage(chooseTemplateUrl),
  nhsAppTemplateSubmittedPage(chooseTemplateUrl),
  previewSubmittedNHSAppTemplatePage(messageTemplatesUrl),
];

const sms = [
  createTextMessageTemplatePage(chooseTemplateUrl),
  createTextMessageTemplateErrorPage(chooseTemplateUrl),
  previewTextMessageTemplatePage(chooseTemplateUrl),
  previewTextMessageTemplateErrorPage(chooseTemplateUrl),
  viewNotYetSubmittedTextMessageTemplatePage(messageTemplatesUrl),
  submitTextMessageTemplatePage(chooseTemplateUrl),
  textMessageTemplateSubmittedPage(chooseTemplateUrl),
  previewSubmittedTextMessageTemplatePage(messageTemplatesUrl),
];

const email = [
  createEmailTemplatePage(chooseTemplateUrl),
  createEmailTemplateErrorPage(chooseTemplateUrl),
  previewEmailTemplatePage(chooseTemplateUrl),
  previewEmailTemplateErrorPage(chooseTemplateUrl),
  viewNotYetSubmittedEmailTemplatePage(messageTemplatesUrl),
  submitEmailTemplatePage(chooseTemplateUrl),
  emailTemplateSubmittedPage(chooseTemplateUrl),
  previewSubmittedEmailTemplatePage(messageTemplatesUrl),
];

const letters = [
  uploadLetterTemplatePage(chooseTemplateUrl),
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

const messagePlans = [
  messagePlansPage(`${baseUrl}/message-plans`)
]

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
  chooseTemplate,
  nhsApp,
  sms,
  email,
  letters,
  userEmails,
  errors,
  messagePlans,
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
