const {
  pageActions: goToPreviewLetterTemplateActions,
} = require('./preview-letter-template.actions');

const pageActions = [
  ...goToPreviewLetterTemplateActions,
  'click element #preview-letter-template-cta',
  'wait for element #request-proof-button to be visible',
];

const requestProofOfTemplatePage = (url) => ({
  name: 'request-proof-of-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  requestProofOfTemplatePage,
};
