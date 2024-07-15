const url = (baseUrl) => `${baseUrl}/create-template`;

const chooseATemplatePage = (baseUrl) => ({
  name: 'choose-a-template',
  url: url(baseUrl),
});

const chooseATemplatePageError = (baseUrl) => ({
  name: 'choose-a-template-error',
  url: url(baseUrl),
  actions: [
    'click element #choose-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  chooseATemplatePage,
  chooseATemplatePageError,
};
