const {
  pageActions: goToCreateTextMessageTemplateActions,
} = require('./create-text-message-template.actions');

const pageActions = [
  ...goToCreateTextMessageTemplateActions,
  'set field #smsTemplateName to example-template-1',
  'set field #smsTemplateMessage to example template message',
  'click element #create-sms-template-submit-button',
  'wait for #preview-sms-template-submit-button to be visible',
];

const previewTextMessageTemplatePage = (url) => ({
  name: 'preview-text-message-template',
  url,
  actions: pageActions,
});

const previewTextMessageTemplateErrorPage = (url) => ({
  name: 'preview-text-message-template-error',
  url,
  actions: [
    ...pageActions,
    'click element #preview-sms-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  previewTextMessageTemplatePage,
  previewTextMessageTemplateErrorPage,
};
