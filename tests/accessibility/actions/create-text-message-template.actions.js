const pageActions = [
  'wait for element #templateType-SMS to be visible',
  'click element #templateType-SMS',
  'click element #choose-a-template-type-submit-button',
  'wait for element #create-sms-template-submit-button to be visible',
];

const createTextMessageTemplatePage = (url) => ({
  name: 'create-text-message-template',
  url,
  actions: pageActions,
});

const createTextMessageTemplateErrorPage = (url) => ({
  name: 'create-text-message-template-error',
  url,
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
