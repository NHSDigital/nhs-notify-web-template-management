
const pageActions = [
  'wait for element .nhsuk-header__navigation-link to be visible',
  'click element .nhsuk-header__navigation-link',
  'wait for element input[type="email"] to be visible',
  'set field input[type="email"] to accessibility-test@nhs.net',
  'set field input[type="password"] to Test-Password1',
  'click element .amplify-button',
  'wait for element .nhsuk-heading-xl to be visible',
  'click element .nhsuk-button',
  'wait for element .nhsuk-form-group to be visible',
];

const chooseATemplatePage = (startUrl) => ({
  name: 'choose-a-template',
  actions: pageActions,
  url: startUrl,
});

const chooseATemplatePageError = (startUrl) => ({
  name: 'choose-a-template-error',
  url: startUrl,
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
  pageActions,
};
