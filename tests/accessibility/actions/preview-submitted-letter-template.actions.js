const pageActions = [
  'wait for element a[href*="preview-submitted-letter-template"] to be visible',
  'click element a[href*="preview-submitted-letter-template"]',
  'wait for element [data-testid="preview-message__heading"] to be visible',
];

const previewSubmittedLetterTemplatePage = (url) => ({
  name: 'preview-submitted-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  previewSubmittedLetterTemplatePage,
};
