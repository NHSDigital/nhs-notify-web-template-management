const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for #preview-letter-template-submit-button to be visible',
];

const previewLetterTemplatePage = (url) => ({
  name: 'preview-letter-template',
  url,
  actions: pageActions,
});

const previewLetterTemplateErrorPage = (url) => ({
  name: 'preview-letter-template-error',
  url,
  actions: [
    ...pageActions,
    'click element #preview-letter-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  previewLetterTemplatePage,
  previewLetterTemplateErrorPage,
};
