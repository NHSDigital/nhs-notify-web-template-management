const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  'wait for element #page-create-nhs-app-template to be visible',
  'click element #page-create-nhs-app-template',
  'click element #choose-template-submit-button',
  'wait for element #create-nhs-app-template-submit-button to be visible',
];

const createNHSAppTemplatePage = (baseUrl) => ({
  name: 'create-nhs-app-template',
  url: url(baseUrl),
  actions: pageActions,
});

const createNHSAppTemplateErrorPage = (baseUrl) => ({
  name: 'create-nhs-app-template-error',
  url: url(baseUrl),
  actions: [
    ...pageActions,
    'click element #create-nhs-app-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
};
