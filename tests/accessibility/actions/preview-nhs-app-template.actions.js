const {
  pageActions: goToCreateNHSAppTemplateActions,
} = require('./create-nhs-app-template.actions');

const pageActions = [
  ...goToCreateNHSAppTemplateActions,
  'set field #nhsAppTemplateName to example-template-1',
  'set field #nhsAppTemplateMessage to example template message',
  'click element #create-nhs-app-template-submit-button',
];

const reviewNHSAppTemplatePage = (url) => ({
  name: 'preview-nhs-app-template',
  url,
  actions: pageActions,
});

const reviewNHSAppTemplateErrorPage = (url) => ({
  name: 'preview-nhs-app-template-error',
  url,
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
