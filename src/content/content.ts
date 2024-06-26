const headerComponent = {
  title: '',
  links: {
    logIn: 'Log in',
    logOut: 'Log out',
  },
};

const footerComponent = {
  nhsEngland: 'NHS England',
  supportLinks: 'Support links',
  links: {
    accessibilityStatement: 'Accessibility statement',
    contactUs: 'Contact us',
    cookies: 'Cookies',
    privacyPolicy: 'Privacy policy',
    termsAndCondition: 'Terms and conditions',
  },
};

const mainLayout = {
  title: 'NHS Notify - Template Management',
  description: 'Template management',
};

const homePage = {
  pageHeading: 'Create and submit a template to NHS Notify',
  text1:
    'Use this tool to create and submit templates you want to send as messages using NHS Notify.',
  text2: 'You can create templates for:',
  list: [
    { key: 'template-1', item: 'NHS App messages' },
    { key: 'template-2', item: 'Emails' },
    { key: 'template-3', item: 'Text messages (SMS)' },
    { key: 'template-4', item: 'Letters' },
  ],
  text3:
    'When you submit a template, it will be used by NHS Notify to set up the messages you want to send.',
  pageSubHeading: 'Before you start',
  text4:
    'Only use this tool if your message content has been signed off by the relevant stakeholders in your team.',
  text5: 'You cannot save a template as a draft and edit it later.',
  text6:
    'If you want to change a submitted template, you must create a new template to replace it.',
  text7:
    'You can access this tool by signing in with your NHSmail account or Care Identity.',
  linkButton: {
    text: 'Start now',
    url: '#',
  },
};

const content = {
  global: {
    mainLayout,
  },
  components: {
    headerComponent,
    footerComponent,
  },
  pages: {
    homePage,
  },
};

export const chooseTemplatePageContent = {
  pageHeading: 'Choose a template type to create',
  errorHeading: 'There is a problem',
  options: [
    { id: 'create-nhs-app-template', text: 'NHS App message' },
    { id: 'create-email-template', text: 'Email' },
    { id: 'create-sms-template', text: 'Text message (SMS)' },
    { id: 'create-letter-template', text: 'Letter' },
  ],
  buttonText: 'Continue',
};

export const createNhsAppTemplatePageContent = {
  pageHeading: 'Create NHS app message template',
  errorHeading: 'There is a problem',
  templateNameLabelText: 'Template name',
  templateNameHintText: 'This will not be visible to recipients',
  templateNameDetailsSummary: 'Naming your templates',
  templateNameDetailsOpeningParagraph: 'You should name your templates in a way that works best for your service or organisation.',
  templateNameDetailsListHeader: 'Common template names include the:',
  templateNameDetailsList: [
    'message channel it uses',
    'subject or reason for the message',
    'intended audience for the template',
    'version number of the template'
  ],
  templateNameDetailsExample: 'For example, \'Email - covid19 2023 - over 65s - version 3\'',
  characterCountText: ' of 5000 characters',
  buttonText: 'Continue',
};

export default content;
