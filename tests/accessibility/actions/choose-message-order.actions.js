const pageActions = [
  'wait for element #choose-message-order-submit-button to be visible',
];

const chooseMessageOrderPage = (url) => ({
  name: 'choose-message-order',
  url,
  actions: pageActions,
});

const chooseMessageOrderPageError = (url) => ({
  name: 'choose-message-order-error',
  url,
  actions: [
    ...pageActions,
    'click element #choose-message-order-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
  ignore: [
    // NHS error summary component has a H2 above the H1.
    'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
  ],
});

module.exports = {
  chooseMessageOrderPage,
  chooseMessageOrderPageError,
};
