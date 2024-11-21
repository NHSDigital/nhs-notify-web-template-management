// const pageActions = [
//   'wait for element #create-template-button to be visible',
//   'wait for element #manage-template-table to be visible',
//   'click element #create-template-button',
// ];

// const manageTemplatesPage = (url) => ({
//   name: 'manage-templates',
//   url,
//   actions: pageActions,
// });

// const createEmailTemplateErrorPage = (url) => ({
//   name: 'create-email-template-error',
//   url,
//   actions: [
//     ...pageActions,
//     'click element #create-email-template-submit-button',
//     'wait for element .nhsuk-error-summary__title to be visible',
//   ],
//   ignore: [
//     // NHS error summary component has a H2 above the H1.
//     'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
//   ],
// });

// module.exports = {
//   pageActions,
//   manageTemplatesPage,
//   createEmailTemplateErrorPage,
// };
