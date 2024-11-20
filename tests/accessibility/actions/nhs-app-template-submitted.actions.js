const {
  pageActions: goToSubmitNHSAppTemplateActions,
} = require('./submit-nhs-app-template.actions');

const pageActions = [
  ...goToSubmitNHSAppTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const NhsAppTemplateSubmittedPage = (url) => ({
  name: 'nhs-app-template-submitted',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  NhsAppTemplateSubmittedPage,
};
