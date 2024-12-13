const pageActions = [
  'wait for element a[href*="view-submitted-email-template"] to be visible',
  'click element a[href*="view-submitted-email-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewSubmittedEmailTemplatePage = (url) => ({
  name: 'view-submitted-email-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewSubmittedEmailTemplatePage,
};
