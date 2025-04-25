const {
  pageActions: goToSubmitLetterTemplateActions,
} = require('./submit-letter-template.actions');

const pageActions = [
  ...goToSubmitLetterTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const letterTemplateSubmittedPage = (url) => ({
  name: 'letter-template-submitted',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  letterTemplateSubmittedPage,
};
