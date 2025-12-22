const {
  pageActions: goToPreviewLetterTemplateActions,
} = require('./preview-letter-template.actions');

const pageActions = [
  ...goToPreviewLetterTemplateActions,
  'wait for [data-test-id=status-tag][data-status=waiting-for-proof] to be visible',
];

const waitingForProofsLetterTemplatePage = (url) => ({
  name: 'proof-available-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  waitingForProofsLetterTemplatePage,
};
