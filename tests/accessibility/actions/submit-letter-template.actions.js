const {
  pageActions: goToPreviewLetterTemplateWithProofsAvailableActions,
} = require('./view-proofs-available-letter-template.actions');

const pageActions = [
  ...goToPreviewLetterTemplateWithProofsAvailableActions,
  'click element #preview-letter-template-cta',
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
