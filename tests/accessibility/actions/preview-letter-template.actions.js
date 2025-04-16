const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for #preview-letter-template-submit-button to be visible',
];

const previewLetterTemplatePage = (url) => ({
  name: 'preview-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  previewLetterTemplatePage,
};
