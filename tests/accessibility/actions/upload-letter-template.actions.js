const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element #templateType-LETTER to be visible',
  'click element #templateType-LETTER',
  'click element #choose-a-template-type-submit-button',
  'wait for element #upload-letter-template-submit-button to be visible',
];

const uploadLetterTemplatePage = (url) => ({
  name: 'upload-letter-template',
  url,
  actions: pageActions,
});

const uploadLetterTemplateErrorPage = (url) => ({
  name: 'upload-letter-template-error',
  url,
  actions: [
    ...pageActions,
    'click element #upload-letter-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  uploadLetterTemplatePage,
  uploadLetterTemplateErrorPage,
};
