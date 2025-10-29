const {
  pageActions: goToPreviewLetterTemplateActions,
} = require('./preview-letter-template.actions');

const pageActions = [
  ...goToPreviewLetterTemplateActions,
  'wait for ul[class^="PreviewTemplateDetails_proofs__"] to be visible',
];

const viewAvailableProofsForLetterTemplatePage = (url) => ({
  name: 'view-available-proofs-for-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  viewAvailableProofsForLetterTemplatePage,
};
