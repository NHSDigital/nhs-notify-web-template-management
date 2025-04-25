const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="preview-letter-template"] to be visible',
  'click element a[href*="preview-letter-template"]',
  'wait for element [data-testid="preview-message__heading"] to be visible',
];

const viewNotYetSubmittedLetterTemplatePage = (url) => ({
  name: 'view-not-yet-submitted-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewNotYetSubmittedLetterTemplatePage,
};
