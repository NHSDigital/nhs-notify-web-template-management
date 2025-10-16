const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element .nhsuk-button to be visible',
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
