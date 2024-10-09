const {
  pageActions: goToSubmitEmailTemplateActions,
} = require('./submit-email-template.actions');

const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  ...goToSubmitEmailTemplateActions,
  'click element #submit-template-button',
  'wait for element #template-submitted to be visible',
];

const emailTemplateSubmittedPage = (baseUrl) => ({
  name: 'email-template-submitted',
  url: url(baseUrl),
  actions: pageActions,
});

module.exports = {
  pageActions,
  emailTemplateSubmittedPage,
};
