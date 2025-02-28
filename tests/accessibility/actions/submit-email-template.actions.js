const {
  pageActions: goToPreviewEmailTemplateActions,
} = require('./preview-email-template.actions');

const pageActions = [
  ...goToPreviewEmailTemplateActions,
  'click element #reviewEmailTemplateAction-email-submit',
  'click element #review-email-template-submit-button',
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
