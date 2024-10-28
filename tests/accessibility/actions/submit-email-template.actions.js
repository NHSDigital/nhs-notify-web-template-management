const {
  pageActions: goToPreviewEmailTemplateActions,
} = require('./preview-email-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToPreviewEmailTemplateActions,
  'click element #reviewEmailTemplateAction-email-submit',
  'click element #review-email-template-submit-button',
  'wait for element #submit-template-button to be visible',
];

const submitEmailTemplatePage = (baseUrl) => ({
  name: 'submit-email-template',
  url: url(baseUrl),
  actions: pageActions,
});

module.exports = {
  pageActions,
  submitEmailTemplatePage,
};
