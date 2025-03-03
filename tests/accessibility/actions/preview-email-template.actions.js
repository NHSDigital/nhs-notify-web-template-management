const {
  pageActions: goToCreateEmailTemplateActions,
} = require('./create-email-template.actions');

const pageActions = [
  ...goToCreateEmailTemplateActions,
  'set field #emailTemplateName to example-template-1',
  'set field #emailTemplateSubjectLine to example subject',
  'set field #emailTemplateMessage to example template message',
  'click element #create-email-template-submit-button',
  'wait for #preview-email-template-submit-button to be visible',
];

const previewEmailTemplatePage = (url) => ({
  name: 'preview-email-app-template',
  url,
  actions: pageActions,
});

const previewEmailTemplateErrorPage = (url) => ({
  name: 'preview-email-template-error',
  url,
  actions: [
    ...pageActions,
    'click element #preview-email-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  previewEmailTemplatePage,
  previewEmailTemplateErrorPage,
};
