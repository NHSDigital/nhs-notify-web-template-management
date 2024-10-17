const {
  pageActions: goToSubmitNHSAppTemplateActions,
} = require('./submit-nhs-app-template.actions');

const pageActions = [
  ...goToSubmitNHSAppTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const NHSAppTemplateSubmittedPage = (startUrl) => ({
  name: 'nhs-app-template-submitted',
  url: startUrl,
  actions: pageActions,
});

module.exports = {
  pageActions,
  NHSAppTemplateSubmittedPage,
};
