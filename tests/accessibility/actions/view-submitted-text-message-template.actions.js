const pageActions = [
  'wait for element a[href*="view-submitted-text-message-template"] to be visible',
  'click element a[href*="view-submitted-text-message-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewSubmittedTextMessageTemplatePage = (url) => ({
  name: 'view-submitted-text-message-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewSubmittedTextMessageTemplatePage,
};