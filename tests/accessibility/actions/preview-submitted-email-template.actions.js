const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element a[href*="preview-submitted-email-template"] to be visible',
  'click element a[href*="preview-submitted-email-template"]',
  'wait for element #preview-heading-message to be visible',
];

const viewSubmittedEmailTemplatePage = (url) => ({
  name: 'preview-submitted-email-template',
  url,
  actions: pageActions,
});

module.exports = {
  viewSubmittedEmailTemplatePage,
};
