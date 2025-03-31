const { readFileSync } = require('node:fs');

const { email, password } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

const signInPageActions = [
  'wait for element button[type="submit"] to be visible',
  `set field input[type="text"] to ${email}`,
  `set field input[type="password"] to ${password}`,
  'click element button[type="submit"]',
];

module.exports = {
  signInPageActions,
};
