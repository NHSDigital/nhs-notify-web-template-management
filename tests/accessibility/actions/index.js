module.exports = {
  ...require('./create-nhs-app-template.actions'),
  ...require('./choose-a-template-type.actions'),
  ...require('./preview-nhs-app-template.actions'),
  ...require('./submit-nhs-app-template.actions'),
  ...require('./create-text-message-template.actions'),
  ...require('./preview-text-message-template.actions'),
  ...require('./submit-text-message-template.actions'),
  ...require('./text-message-template-submitted.actions'),
  ...require('./nhs-app-template-submitted.actions'),
};
