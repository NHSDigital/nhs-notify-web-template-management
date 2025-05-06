const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = (templateId) => [
  ...signInPageActions,
  'wait for element a[href*="preview-letter-template"] to be visible',
  `click element a[href*="preview-letter-template/${templateId}"]`,
  'wait for element [data-testid="preview-message__heading"] to be visible',
];

const viewNotYetSubmittedLetterTemplatePage = (url, templateId) => ({
  name: 'view-not-yet-submitted-letter-template',
  url,
  actions: pageActions(templateId),
});

module.exports = {
  viewNotYetSubmittedLetterTemplatePage,
};
