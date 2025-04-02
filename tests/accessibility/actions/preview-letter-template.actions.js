const { readFileSync } = require('node:fs');
const { signInPageActions } = require('./sign-in-page.actions');

const { templateId } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

const pageActions = [
  ...signInPageActions,
  'wait for #preview-letter-template-submit-button to be visible',
];

const previewLetterTemplatePage = (baseUrl) => ({
  name: 'preview-letter-template',
  url: `${baseUrl}/preview-letter-template/${templateId}`,
  actions: pageActions,
});

module.exports = {
  previewLetterTemplatePage,
  previewLetterTemplateErrorPage,
};
