const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element #create-template-button to be visible',
];

const messageTemplatesPage = (url) => ({
  name: 'message-templates',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  messageTemplatesPage,
};
