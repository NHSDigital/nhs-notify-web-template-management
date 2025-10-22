const { readFileSync } = require('node:fs');

const signInPageActions = (email, password) => [
  'wait for element button[type="submit"] to be visible',
  `set field input[type="text"] to ${email}`,
  `set field input[type="password"] to ${password}`,
  'click element button[type="submit"]',
];

export const withSignIn = (accessibilityTest, email, password) => ({
  ...accessibilityTest,
  actions: [
    signInPageActions,
    ...accessibilityTest.actions
  ]
});

module.exports = {
  signInPageActions,
  withSignIn,
};
