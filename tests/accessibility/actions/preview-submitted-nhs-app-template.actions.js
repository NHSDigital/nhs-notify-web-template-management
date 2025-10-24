const pageActions = [
  'wait for element a[href*="preview-submitted-nhs-app-template"] to be visible',
  'click element a[href*="preview-submitted-nhs-app-template"]',
  'wait for element #preview-heading-message to be visible',
];

const previewSubmittedNHSAppTemplatePage = (url) => ({
  name: 'preview-submitted-nhs-app-template',
  url,
  actions: pageActions,
});

module.exports = {
  previewSubmittedNHSAppTemplatePage,
};
