const {
  pageActions: goToCreateEmailTemplateActions,
} = require('./create-email-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToCreateEmailTemplateActions,
  'set field #emailTemplateName to example-template-1',
  'set field #emailTemplateSubjectLine to example subject',
  'set field #emailTemplateMessage to example template message',
  'click element #create-email-template-submit-button',
  'wait for #review-email-template-submit-button to be visible',
];

const reviewEmailTemplatePage = (baseUrl) => ({
  name: 'preview-email-app-template',
  url: url(baseUrl),
  actions: pageActions,
});

const reviewEmailTemplateErrorPage = (baseUrl) => ({
  name: 'preview-email-template-error',
  url: url(baseUrl),
  actions: [
    ...pageActions,
    'click element #review-email-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  reviewEmailTemplatePage,
  reviewEmailTemplateErrorPage,
};
