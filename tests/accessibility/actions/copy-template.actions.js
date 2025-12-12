const {
  pageActions: goToCreateNHSAppTemplateActions,
} = require('./create-nhs-app-template.actions');

const pageActions = [
  ...goToCreateNHSAppTemplateActions,
  'set field #nhsAppTemplateName to example-template-1',
  'set field #nhsAppTemplateMessage to example template message',
  'click element #create-nhs-app-template-submit-button',
  'wait for #previewNHSAppTemplateAction-nhsapp-submit to be visible',
  'click element [data-testid="back-link-top"]',
  'wait for element #create-template-button to be visible',
  'click element #copy-template-link-0',
];

const copyTemplatePage = (url) => ({
  name: 'copy-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  copyTemplatePage,
};
