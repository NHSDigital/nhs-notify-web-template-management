const pageActions = [
  'wait for element a[href*="preview-submitted-email-template"] to be visible',
  'click element a[href*="preview-submitted-email-template"]',
  'wait for element #preview-heading-message to be visible',
];

const previewSubmittedEmailTemplatePage = (url) => ({
  name: 'preview-submitted-email-template',
  url,
  actions: pageActions,
});

module.exports = {
  previewSubmittedEmailTemplatePage,
};
