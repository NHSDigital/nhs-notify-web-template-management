const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  'wait for element #templateType-SMS to be visible',
  'click element #templateType-SMS',
  'click element #choose-a-template-type-submit-button',
  'wait for element #create-sms-template-submit-button to be visible',
];

const createTextMessageTemplatePage = (baseUrl) => ({
  name: 'create-sms-template',
  url: url(baseUrl),
  actions: pageActions,
});

const createTextMessageTemplateErrorPage = (baseUrl) => ({
  name: 'create-sms-template-error',
  url: url(baseUrl),
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
