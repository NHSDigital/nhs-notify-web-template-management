const pageActions = [
  'wait for [data-testid="preview-message__heading"] to be visible',
];

const previewLetterTemplatePage = (url) => ({
  name: 'preview-letter-template',
  url,
  actions: pageActions,
});

const previewLetterTemplatePageWithError = (url) => ({
  name: 'preview-letter-template',
  url,
  actions: pageActions,
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  pageActions,
  previewLetterTemplatePage,
  previewLetterTemplatePageWithError,
};
