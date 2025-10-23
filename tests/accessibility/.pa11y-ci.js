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
  withSignIn,
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
  messagePlansPage,
  chooseMessageOrderPage,
  chooseMessageOrderPageError,
  createMessagePlanPage,
  createMessagePlanPageError,
} = require('./actions');

const pa11yConfig = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

const {
  users: {
    mainUser: {
      email,
      password,
    },
    routingUser: {
      email: routingEnabledEmail,
      password: routingEnabledPassword,
    },
  },
  templateIds,
} = pa11yConfig;

const baseUrl = 'http://localhost:3000/templates';
const chooseTemplateUrl = `${baseUrl}/choose-a-template-type`;
const startUrl = 'http://localhost:3000/templates/create-and-submit-templates';
const messageTemplatesUrl = `${baseUrl}/message-templates`;

function previewLetterTemplateUrl(clientId, status) {
  return `${baseUrl}/preview-letter-template/${templateIds[clientId][status]}`;
}

const allTemplatesTests = [
  withSignIn(messageTemplatesPage(messageTemplatesUrl)),
  withSignIn(copyTemplatePage(chooseTemplateUrl)),
];

const chooseTemplateTests = [
  withSignIn(chooseATemplatePage(chooseTemplateUrl), email, password),
  withSignIn(chooseATemplatePageError(chooseTemplateUrl), email, password),
];

const nhsAppTests = [
  withSignIn(createNHSAppTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(createNHSAppTemplateErrorPage(chooseTemplateUrl), email, password),
  withSignIn(previewNHSAppTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(previewNHSAppTemplateErrorPage(chooseTemplateUrl), email, password),
  withSignIn(viewNotYetSubmittedNHSAppTemplatePage(messageTemplatesUrl), email, password),
  withSignIn(submitNHSAppTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(nhsAppTemplateSubmittedPage(chooseTemplateUrl), email, password),
  withSignIn(previewSubmittedNHSAppTemplatePage(messageTemplatesUrl), email, password),
];

const smsTests = [
  withSignIn(createTextMessageTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(createTextMessageTemplateErrorPage(chooseTemplateUrl), email, password),
  withSignIn(previewTextMessageTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(previewTextMessageTemplateErrorPage(chooseTemplateUrl), email, password),
  withSignIn(viewNotYetSubmittedTextMessageTemplatePage(messageTemplatesUrl), email, password),
  withSignIn(submitTextMessageTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(textMessageTemplateSubmittedPage(chooseTemplateUrl), email, password),
  withSignIn(previewSubmittedTextMessageTemplatePage(messageTemplatesUrl), email, password),
];

const emailTests = [
  withSignIn(createEmailTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(createEmailTemplateErrorPage(chooseTemplateUrl), email, password),
  withSignIn(previewEmailTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(previewEmailTemplateErrorPage(chooseTemplateUrl), email, password),
  withSignIn(viewNotYetSubmittedEmailTemplatePage(messageTemplatesUrl), email, password),
  withSignIn(submitEmailTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(emailTemplateSubmittedPage(chooseTemplateUrl), email, password),
  withSignIn(previewSubmittedEmailTemplatePage(messageTemplatesUrl), email, password),
];

const lettersTests = [
  withSignIn(uploadLetterTemplatePage(chooseTemplateUrl), email, password),
  withSignIn(previewLetterTemplatePage(previewLetterTemplateUrl('accessibility-test-client', 'PENDING_UPLOAD')), email, password),
  withSignIn(previewLetterTemplatePageWithError(previewLetterTemplateUrl('accessibility-test-client', 'VIRUS_SCAN_FAILED')), email, password),
  withSignIn(previewLetterTemplatePage(previewLetterTemplateUrl('accessibility-test-client', 'PENDING_VALIDATION')), email, password),
  withSignIn(previewLetterTemplatePageWithError(previewLetterTemplateUrl('accessibility-test-client', 'VALIDATION_FAILED')), email, password),
  withSignIn(viewNotYetSubmittedLetterTemplatePage(messageTemplatesUrl, templateIds['accessibility-test-client'].PENDING_PROOF_REQUEST), email, password),
  withSignIn(requestProofOfTemplatePage(previewLetterTemplateUrl('accessibility-test-client', 'PENDING_PROOF_REQUEST')), email, password),
  withSignIn(waitingForProofsLetterTemplatePage(previewLetterTemplateUrl('accessibility-test-client', 'WAITING_FOR_PROOF')), email, password),
  withSignIn(viewAvailableProofsForLetterTemplatePage(previewLetterTemplateUrl('accessibility-test-client', 'PROOF_AVAILABLE')), email, password),
  withSignIn(submitLetterTemplatePage(previewLetterTemplateUrl('accessibility-test-client', 'PROOF_AVAILABLE')), email, password),
  withSignIn(letterTemplateSubmittedPage(previewLetterTemplateUrl('accessibility-test-client', 'PROOF_AVAILABLE')), email, password),
  withSignIn(previewSubmittedLetterTemplatePage(messageTemplatesUrl), email, password),
];

const landingPageTests = [{ url: startUrl, name: 'landing-page' }];

const errorsTests = [
  {
    url: `${baseUrl}/invalid-template`,
    actions: [...signInPageActions(email, password), 'wait for h1 to be visible'],
    name: 'invalid-template',
  },
  {
    url: `${baseUrl}/upload-letter-template/client-id-and-campaign-id-required`,
    actions: [...signInPageActions(email, password), 'wait for h1 to be visible'],
    name: 'client-campaign-id-required',
  },
];

const userEmailsTests = [
  {
    url: `${baseUrl}/testing/template-submitted-email.html`,
    name: 'email-template',
  },
  {
    url: `${baseUrl}/testing/proof-requested-email.html`,
    name: 'email-template',
  },
];

const routingTests = [
  withSignIn(messagePlansPage(`${baseUrl}/message-plans`), routingEnabledEmail, routingEnabledPassword),
  withSignIn(chooseMessageOrderPage(`${baseUrl}/message-plans/choose-message-order`), routingEnabledEmail, routingEnabledPassword),
  withSignIn(chooseMessageOrderPageError(`${baseUrl}/message-plans/choose-message-order`), routingEnabledEmail, routingEnabledPassword),
  withSignIn(createMessagePlanPage(`${baseUrl}/message-plans/create-message-plan?messageOrder=NHSAPP`), routingEnabledEmail, routingEnabledPassword),
  withSignIn(createMessagePlanPageError(`${baseUrl}/message-plans/create-message-plan?messageOrder=NHSAPP`), routingEnabledEmail, routingEnabledPassword),
];

const templatesPagesWithRoutingContentEnabledTests = [
  withSignIn(viewNotYetSubmittedLetterTemplatePage(messageTemplatesUrl, templateIds['routing-accessibility-test-client'].PENDING_PROOF_REQUEST), routingEnabledEmail, routingEnabledPassword),
  withSignIn(viewNotYetSubmittedEmailTemplatePage(messageTemplatesUrl), routingEnabledEmail, routingEnabledPassword),
  withSignIn(viewNotYetSubmittedTextMessageTemplatePage(messageTemplatesUrl), routingEnabledEmail, routingEnabledPassword),
  withSignIn(viewNotYetSubmittedNHSAppTemplatePage(messageTemplatesUrl), routingEnabledEmail, routingEnabledPassword),
  withSignIn(submitLetterTemplatePage(previewLetterTemplateUrl('routing-accessibility-test-client', 'PROOF_AVAILABLE')), routingEnabledEmail, routingEnabledPassword),
  withSignIn(submitEmailTemplatePage(chooseTemplateUrl), routingEnabledEmail, routingEnabledPassword),
  withSignIn(submitTextMessageTemplatePage(chooseTemplateUrl), routingEnabledEmail, routingEnabledPassword),
  withSignIn(submitNHSAppTemplatePage(chooseTemplateUrl), routingEnabledEmail, routingEnabledPassword),
];

const allJourneys = {
  landingPageTests,
  allTemplatesTests,
  chooseTemplateTests,
  nhsAppTests,
  smsTests,
  emailTests,
  lettersTests,
  userEmailsTests,
  errorsTests,
  routingTests,
  templatesPagesWithRoutingContentEnabledTests,
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
    concurrency: 4,
  },
};
