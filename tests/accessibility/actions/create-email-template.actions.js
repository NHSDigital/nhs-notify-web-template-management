const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  'wait for element #templateType-EMAIL to be visible',
  'click element #templateType-EMAIL',
  'click element #choose-a-template-type-submit-button',
  'wait for element #create-email-template-submit-button to be visible',
];

const createEmailTemplatePage = (baseUrl) => ({
  name: 'create-email-template',
  url: url(baseUrl),
  actions: pageActions,
});

const createEmailTemplateErrorPage = (baseUrl) => ({
  name: 'create-email-template-error',
  url: url(baseUrl),
  actions: [
    ...pageActions,
    'click element #create-email-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  createEmailTemplatePage,
  createEmailTemplateErrorPage,
};
