const {
  pageActions: goToCreateNHSAppTemplateActions,
} = require('./create-nhs-app-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToCreateNHSAppTemplateActions,
  'set field #nhsAppTemplateName to example-template-1',
  'set field #nhsAppTemplateMessage to example template message',
  'click element #create-nhs-app-template-submit-button',
];

const reviewNHSAppTemplatePage = (baseUrl) => ({
  name: 'preview-nhs-app-template',
  url: url(baseUrl),
  actions: pageActions,
});

const reviewNHSAppTemplateErrorPage = (baseUrl) => ({
  name: 'preview-nhs-app-template-error',
  url: url(baseUrl),
  actions: [
    ...pageActions,
    'wait for #preview-nhs-app-template-submit-button to be visible',
    'click element #preview-nhs-app-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  reviewNHSAppTemplatePage,
  reviewNHSAppTemplateErrorPage,
};
