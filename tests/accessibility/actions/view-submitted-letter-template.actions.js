const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="view-submitted-letter-template"] to be visible',
  'click element a[href*="view-submitted-letter-template"]',
  'wait for element [data-testid="preview-message__heading"] to be visible',
];

const viewSubmittedLetterTemplatePage = (url) => ({
  name: 'view-submitted-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewSubmittedLetterTemplatePage,
};
