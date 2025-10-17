const { signInPageActions } = require('./sign-in-page.actions');

const pageActions = [
  ...signInPageActions,
  'wait for element .nhsuk-button to be visible',
];

const createMessagePlanPage = (url) => ({
  name: 'create-message-plan',
  url,
  actions: pageActions,
});

const createMessagePlanPageError = (url) => ({
  name: 'create-message-plan-error',
  url,
  actions: [
    ...pageActions,
    'click element .nhsuk-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  createMessagePlanPage,
  createMessagePlanPageError,
};
