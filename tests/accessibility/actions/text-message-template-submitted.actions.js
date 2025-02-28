const {
  pageActions: goToSubmitTextMessageTemplateActions,
} = require('./submit-text-message-template.actions');

const pageActions = [
  ...goToSubmitTextMessageTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const textMessageTemplateSubmittedPage = (url) => ({
  name: 'text-message-template-submitted',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  textMessageTemplateSubmittedPage,
};
