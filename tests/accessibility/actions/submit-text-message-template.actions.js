const {
  pageActions: goToPreviewTextMessageTemplateActions,
} = require('./preview-text-message-template.actions');

const pageActions = [
  ...goToPreviewTextMessageTemplateActions,
  'click element #previewSMSTemplateAction-sms-submit',
  'click element #preview-sms-template-submit-button',
  'wait for element #submit-template-button to be visible',
];

const submitTextMessageTemplatePage = (url) => ({
  name: 'submit-text-message-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  submitTextMessageTemplatePage,
};
