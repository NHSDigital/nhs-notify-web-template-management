const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="view-submitted-nhs-app-template"] to be visible',
  'click element a[href*="view-submitted-nhs-app-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewSubmittedNHSAppTemplatePage = (url) => ({
  name: 'view-submitted-nhs-app-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewSubmittedNHSAppTemplatePage,
};
