const {
  pageActions: goToPreviewLetterTemplateActions,
} = require('./preview-letter-template.actions');

const pageActions = [
  ...goToPreviewLetterTemplateActions,
  'click element #preview-letter-template-submit-button',
  'wait for element #submit-template-button to be visible',
];

const submitLetterTemplatePage = (url) => ({
  name: 'submit-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  submitLetterTemplatePage,
};
