const goToCreateNhsAppTemplatePage = (host) => ({
  __description: 'Go to Create NHS App Template Page',
  url: host,
  actions: [
    'wait for element #page-create-nhs-app-template to be visible',
    'click element #page-create-nhs-app-template',
    'wait for element #choose-template-submit-button to be visible',
    'click element #choose-template-submit-button',
    'wait for element #create-nhs-app-template-submit-button to be visible',
  ],
});

module.exports = {
    goToCreateNhsAppTemplatePage,
};
