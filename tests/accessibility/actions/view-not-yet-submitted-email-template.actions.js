const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="preview-email-template"] to be visible',
  'click element a[href*="preview-email-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewNotYetSubmittedEmailTemplatePage = (url) => ({
  name: 'view-not-yet-submitted-email-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewNotYetSubmittedEmailTemplatePage,
};
