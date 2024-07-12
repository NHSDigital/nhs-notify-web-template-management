const url = (baseUrl) => `${baseUrl}/create-template`;

const pageActions = [
  'wait for element #page-create-nhs-app-template to be visible',
  'click element #page-create-nhs-app-template',
  'click element #choose-template-submit-button',
  'wait for element #create-nhs-app-template-submit-button to be visible',
];

const createNHSAppTemplatePage = (baseUrl) => ({
  name: 'create-nhs-app-template',
  url: url(baseUrl),
  actions: pageActions,
});

const createNHSAppTemplateErrorPage = (baseUrl) => ({
  name: 'create-nhs-app-template',
  url: url(baseUrl),
  actions: [
    ...pageActions,
    'click element #create-nhs-app-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
});

module.exports = {
  pageActions,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
};
