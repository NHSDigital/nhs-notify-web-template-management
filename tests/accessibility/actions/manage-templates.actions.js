const pageActions = [
  'wait for element #create-template-button to be visible',
  'click element #create-template-button',
];

const manageTemplatesPage = (url) => ({
  name: 'manage-templates',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  manageTemplatesPage,
};
