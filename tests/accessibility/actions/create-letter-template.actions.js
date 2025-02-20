const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element #templateType-LETTER to be visible',
  'click element #templateType-LETTER',
  'click element #choose-a-template-type-submit-button',
  'wait for element #placeholder to be visible',
];

const createLetterTemplatePage = (url) => ({
  name: 'create-letter-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  createLetterTemplatePage,
};
