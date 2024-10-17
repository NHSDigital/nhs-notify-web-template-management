const {
  pageActions: goToPreviewTextMessageTemplateActions,
} = require('./preview-text-message-template.actions');

const pageActions = [
  ...goToPreviewTextMessageTemplateActions,
  'click element #reviewSMSTemplateAction-sms-submit',
  'click element #review-sms-template-submit-button',
  'wait for element #submit-template-button to be visible',
];

const submitTextMessageTemplatePage = (startUrl) => ({
  name: 'submit-text-message-template',
  url: startUrl,
  actions: pageActions,
});

module.exports = {
  pageActions,
  submitTextMessageTemplatePage,
};
