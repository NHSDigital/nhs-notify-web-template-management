const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="preview-text-message-template"] to be visible',
  'click element a[href*="preview-text-message-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewNotYetSubmittedTextMessageTemplatePage = (url) => ({
  name: 'view-not-yet-submitted-text-message-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewNotYetSubmittedTextMessageTemplatePage,
};
