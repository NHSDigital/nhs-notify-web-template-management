const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="preview-nhs-app-template"] to be visible',
  'click element a[href*="preview-nhs-app-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewNotYetSubmittedNHSAppTemplatePage = (url) => ({
  name: 'view-not-yet-submitted-nhs-app-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewNotYetSubmittedNHSAppTemplatePage,
};
