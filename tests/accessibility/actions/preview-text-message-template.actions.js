const {
  pageActions: goToCreateTextMessageTemplateActions,
} = require('./create-text-message-template.actions');

const pageActions = [
  ...goToCreateTextMessageTemplateActions,
  'set field #smsTemplateName to example-template-1',
  'set field #smsTemplateMessage to example template message',
  'click element #create-sms-template-submit-button',
  'wait for #review-sms-template-submit-button to be visible',
];

const reviewTextMessageTemplatePage = (startUrl) => ({
  name: 'preview-text-message-template',
  url: startUrl,
  actions: pageActions,
});

const reviewTextMessageTemplateErrorPage = (startUrl) => ({
  name: 'preview-text-message-template-error',
  url: startUrl,
  actions: [
    ...pageActions,
    'click element #review-sms-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  reviewTextMessageTemplatePage,
  reviewTextMessageTemplateErrorPage,
};
