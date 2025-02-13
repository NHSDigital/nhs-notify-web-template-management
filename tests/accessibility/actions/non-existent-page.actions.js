const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element #not-found to be visible',
];

const nonExistentPage = (url) => ({
  name: '404-test',
  url,
  actions: pageActions,
});

module.exports = {
  nonExistentPage,
};
