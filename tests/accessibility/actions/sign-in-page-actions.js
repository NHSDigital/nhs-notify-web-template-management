const { readFileSync } = require('node:fs');

const { email, password } = JSON.parse(readFileSync('./auth.json', 'utf8'));

const pageActions = [
  'wait for element .nhsuk-header__navigation-link to be visible',
  'click element .nhsuk-header__navigation-link',
  'wait for element button[type="submit"] to be visible',
  'wait for element input[type="text"] to be visible',
  `set field input[type="text"] to ${email}`,
  `set field input[type="password"] to ${password}`,
  'click element button[type="submit"]',
  'wait for element .nhsuk-heading-xl to be visible',
  'click element .nhsuk-button',
  'wait for element .nhsuk-form-group to be visible',
];

module.exports = {
  pageActions,
};
