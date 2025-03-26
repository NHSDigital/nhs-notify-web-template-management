const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="preview-submitted-text-message-template"] to be visible',
  'click element a[href*="preview-submitted-text-message-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewSubmittedTextMessageTemplatePage = (url) => ({
  name: 'preview-submitted-text-message-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewSubmittedTextMessageTemplatePage,
};
