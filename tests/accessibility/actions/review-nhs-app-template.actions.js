const {
  pageActions: goToCreateNHSAppTemplateActions,
} = require('./create-nhs-app-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToCreateNHSAppTemplateActions,
  'set element #nhsAppTemplateName to example-template-1',
  'set element #nhsAppTemplateMessage to example template message',
  'select element #create-nhs-app-template-submit-button',
];

const reviewNHSAppTemplatePage = (baseUrl) => ({
  name: 'review-nhs-app-template',
  url: url(baseUrl),
  actions: pageActions,
});

const reviewNHSAppTemplateErrorPage = (baseUrl) => ({
  name: 'review-nhs-app-template-error',
  url: url(baseUrl),
  actions: [
    ...pageActions,
    'click element #review-nhs-app-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
});

module.exports = {
  pageActions,
  reviewNHSAppTemplatePage,
  reviewNHSAppTemplateErrorPage,
};
