const {
  pageActions: goToSubmitNHSAppTemplateActions,
} = require('./submit-nhs-app-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToSubmitNHSAppTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const NHSAppTemplateSubmittedPage = (baseUrl) => ({
  name: 'nhs-app-template-submitted',
  url: url(baseUrl),
  actions: pageActions,
});

module.exports = {
  pageActions,
  NHSAppTemplateSubmittedPage,
};
