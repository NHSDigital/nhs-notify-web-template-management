const {
  pageActions: goToSubmitEmailTemplateActions,
} = require('./submit-email-template.actions');

const pageActions = [
  ...goToSubmitEmailTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const emailTemplateSubmittedPage = (url) => ({
  name: 'email-template-submitted',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  emailTemplateSubmittedPage,
};
