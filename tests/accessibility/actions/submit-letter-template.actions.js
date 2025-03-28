const {
  pageActions: goToPreviewLetterTemplateActions,
} = require('./preview-letter-template.actions');

const pageActions = [
  ...goToPreviewLetterTemplateActions,
  'click element #previewEmailTemplateAction-email-submit',
  'click element #preview-email-template-submit-button',
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
