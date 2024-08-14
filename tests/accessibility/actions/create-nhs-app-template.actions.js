const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  'wait for element #templateType-NHS_APP to be visible',
  'click element #templateType-NHS_APP',
  'click element #choose-a-template-type-submit-button',
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
