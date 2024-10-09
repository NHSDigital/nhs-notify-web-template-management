const {
  pageActions: goToPreviewTextMessageTemplateActions,
} = require('./preview-text-message-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToPreviewTextMessageTemplateActions,
  'click element #reviewSMSTemplateAction-sms-submit',
  'click element #review-sms-template-submit-button',
  'wait for element #submit-template-button to be visible',
];

const submitTextMessageTemplatePage = (baseUrl) => ({
  name: 'submit-text-message-template',
  url: url(baseUrl),
  actions: pageActions,
});

module.exports = {
  pageActions,
  submitTextMessageTemplatePage,
};
