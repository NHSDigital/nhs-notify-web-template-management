/* eslint-disable unicorn/prefer-module, global-require  */
module.exports = {
  ...require('./create-nhs-app-template.actions'),
  ...require('./choose-a-template.actions'),
  ...require('./review-nhs-app-template.actions'),
};
