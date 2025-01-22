const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element #choose-a-template-type-submit-button to be visible',
];

const chooseATemplatePage = (url) => ({
  name: 'choose-a-template',
  url,
  actions: pageActions,
});

const chooseATemplatePageError = (url) => ({
  name: 'choose-a-template-error',
  url,
  actions: [
    ...pageActions,
    'click element #choose-a-template-type-submit-button',
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
