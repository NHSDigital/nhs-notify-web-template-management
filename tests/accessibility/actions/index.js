module.exports = {
  ...require('./create-nhs-app-template.actions'),
  ...require('./choose-a-template-type.actions'),
  ...require('./preview-nhs-app-template.actions'),
  ...require('./submit-nhs-app-template.actions'),
  ...require('./create-text-message-template.actions'),
  ...require('./nhs-app-template-submitted.actions'),
  ...require('./create-email-template.actions'),
  ...require('./preview-email-template.actions'),
  ...require('./submit-email-template.actions'),
  ...require('./email-template-submitted.actions'),
};
