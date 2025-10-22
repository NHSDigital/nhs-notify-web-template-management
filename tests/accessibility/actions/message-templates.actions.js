const pageActions = [
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
