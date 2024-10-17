const { pageActions } = require('./sign-in-page-actions');

const errorPage = (startUrl, errorPageUrl) => ({
  name: 'error-404',
  actions: [...pageActions, `navigate to ${errorPageUrl}`],
  url: startUrl,
});

module.exports = {
  errorPage,
};
