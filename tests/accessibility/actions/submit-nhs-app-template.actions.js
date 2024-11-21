const {
  pageActions: goToPreviewNHSAppTemplateActions,
} = require('./preview-nhs-app-template.actions');

const pageActions = [
  ...goToPreviewNHSAppTemplateActions,
  'wait for #reviewNHSAppTemplateAction-nhsapp-submit to be visible',
  'click element #reviewNHSAppTemplateAction-nhsapp-submit',
  'wait for #preview-nhs-app-template-submit-button to be visible',
  'click element #preview-nhs-app-template-submit-button',
  'wait for element #submit-template-button to be visible',
];

const submitNHSAppTemplatePage = (url) => ({
  name: 'preview-nhs-app-template',
  url,
  actions: pageActions,
});

module.exports = {
  pageActions,
  submitNHSAppTemplatePage,
};
