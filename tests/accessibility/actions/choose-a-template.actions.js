const url = (baseUrl) => `${baseUrl}/create-template`;

const chooseATemplatePage = (baseUrl) => ({
  name: 'choose-a-template',
  url: url(baseUrl),
});

const chooseATemplatePageError = (baseUrl) => ({
  name: 'choose-a-template-error',
  url: url(baseUrl),
  actions: [
    'click element #choose-template-submit-button',
    'wait for element .nhsuk-error-summary__title to be visible',
  ],
});

module.exports = {
  chooseATemplatePage,
  chooseATemplatePageError,
};
