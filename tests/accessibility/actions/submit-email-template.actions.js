const {
  pageActions: goToPreviewEmailTemplateActions,
} = require('./preview-email-template.actions');

const pageActions = [
  ...goToPreviewEmailTemplateActions,
  'click element #previewEmailTemplateAction-email-submit',
  'click element #preview-email-template-submit-button',
  'wait for element #submit-template-button to be visible',
];

const submitEmailTemplatePage = (url) => ({
  name: 'submit-email-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  submitEmailTemplatePage,
};
