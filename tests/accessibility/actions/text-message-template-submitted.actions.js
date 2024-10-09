const {
  pageActions: goToSubmitTextMessageTemplateActions,
} = require('./submit-text-message-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToSubmitTextMessageTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const textMessageTemplateSubmittedPage = (baseUrl) => ({
  name: 'text-message-template-submitted',
  url: url(baseUrl),
  actions: pageActions,
});

module.exports = {
  pageActions,
  textMessageTemplateSubmittedPage,
};
