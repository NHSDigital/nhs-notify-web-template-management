const pageActions = [
  'wait for element a[href*="preview-submitted-text-message-template"] to be visible',
  'click element a[href*="preview-submitted-text-message-template"]',
  'wait for element #preview-heading-message to be visible',
];

const previewSubmittedTextMessageTemplatePage = (url) => ({
  name: 'preview-submitted-text-message-template',
  url,
  actions: pageActions,
});

module.exports = {
  previewSubmittedTextMessageTemplatePage,
};
