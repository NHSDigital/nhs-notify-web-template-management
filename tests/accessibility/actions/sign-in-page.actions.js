const signInPageActions = (email, password) => [
  'wait for element button[type="submit"] to be visible',
  `set field input[type="text"] to ${email}`,
  `set field input[type="password"] to ${password}`,
  'click element button[type="submit"]',
];

const withSignIn = (accessibilityTest, email, password) => ({
  ...accessibilityTest,
  actions: [
    ...signInPageActions(email, password),
    ...accessibilityTest.actions
  ]
});

module.exports = {
  signInPageActions,
  withSignIn,
};
