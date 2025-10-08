const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element #create-message-plan-button to be visible',
  'click element #message-plans-list-draft',
  'click element #message-plans-list-production',
];

const messagePlansPage = (url) => ({
  name: 'message-plans',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  messagePlansPage,
};
