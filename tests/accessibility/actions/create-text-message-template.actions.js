const pageActions = [
  'wait for element #templateType-SMS to be visible',
  'click element #templateType-SMS',
  'click element #choose-a-template-type-submit-button',
  'wait for element #create-sms-template-submit-button to be visible',
];

const createTextMessageTemplatePage = (startUrl) => ({
  name: 'create-text-message-template',
  url: startUrl,
  actions: pageActions,
});

const createTextMessageTemplateErrorPage = (startUrl) => ({
  name: 'create-text-message-template-error',
  url: startUrl,
  actions: [
    ...pageActions,
    'click element #create-sms-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  createTextMessageTemplatePage,
  createTextMessageTemplateErrorPage,
};
