const { readFileSync } = require('node:fs');
const { signInPageActions } = require('./sign-in-page.actions');

const { templateId } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

const pageActions = [
  ...signInPageActions,
  'wait for #review-letter-template-submit-button to be visible',
];

const reviewLetterTemplatePage = (baseUrl) => ({
  name: 'preview-letter-template',
  url: `${baseUrl}/preview-letter-template/${templateId}`,
  actions: pageActions,
});

const reviewLetterTemplateErrorPage = (baseUrl) => ({
  name: 'preview-letter-template-error',
  url: `${baseUrl}/preview-letter-template/${templateId}`,
  actions: [
    ...pageActions,
    'click element #review-letter-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  reviewLetterTemplatePage,
  reviewLetterTemplateErrorPage,
};
