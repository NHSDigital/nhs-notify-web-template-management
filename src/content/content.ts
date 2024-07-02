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

const personalisationComponent = {
  header: 'Personalisation',
  details: {
    title: 'Personalisation details',
    text1:
      'Use double brackets to add a personalisation field to your content. For example:',
    codeBlockText: 'Hello ((firstName)), your NHS number is ((nhsNumber))',
    text2: 'NHS Notify gets data from PDS to populate personalisation fields.',
    text3: 'You can use:',
    list: [
      { id: 'pds-item-1', item: '((fullName))' },
      { id: 'pds-item-2', item: '((firstName))' },
      { id: 'pds-item-3', item: '((middleNames))' },
      { id: 'pds-item-4', item: '((lastName))' },
      { id: 'pds-item-5', item: '((nhsNumber))' },
      { id: 'pds-item-6', item: '((namePrefix))' },
      { id: 'pds-item-7', item: '((nameSuffix))' },
      { id: 'pds-item-8', item: '((address_line_1))' },
      { id: 'pds-item-9', item: '((address_line_2))' },
      { id: 'pds-item-10', item: '((address_line_3))' },
      { id: 'pds-item-11', item: '((address_line_4))' },
      { id: 'pds-item-12', item: '((address_line_5))' },
      { id: 'pds-item-13', item: '((address_line_6))' },
      { id: 'pds-item-14', item: '((address_line_7))' },
    ],
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
    { key: 'template-2', item: 'emails' },
    { key: 'template-3', item: 'text messages (SMS)' },
    { key: 'template-4', item: 'letters' },
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
    url: '/choose-template',
  },
};

const previewEmailFormComponent = {
  sectionHeader: 'Email template',
  details: {
    heading: 'Who your email will be sent from',
    text: [
      'Set your reply-to and from email addresses during onboarding.',
      'If you need to set up a different reply-to or from address for other messages, contact our onboarding team.',
    ],
  },
  form: {
    heading: 'What would you like to do next with this template?',
    options: [
      { id: 'email-edit', text: 'Edit' },
      { id: 'email-send', text: 'Send a test email' },
      { id: 'email-submit', text: 'Submit' },
    ],
  },
};

const previewLetterFormComponent = {
  sectionHeader: 'Letter template',
  details: {
    heading: 'Who your letter will be sent from',
    text: [
      `The return address is set by NHS Notify's suppliers and is printed on each letter's envelope.`,
      'If you want recipients to reply to you by letter, add your address in the content of your letter. Letter templates do not have a section for a reply address.',
    ],
  },
  form: {
    heading: 'What would you like to do next with this template?',
    options: [
      { id: 'letter-edit', text: 'Edit' },
      { id: 'letter-preview', text: 'Preview (PDF)' },
      { id: 'letter-submit', text: 'Submit' },
    ],
  },
};

const previewNHSAppFormComponent = {
  sectionHeader: 'NHS App message template',
  details: {
    heading: 'Who your NHS App message will be sent from',
    text: [
      'Set your NHS App message sender name during onboarding.',
      'If you need to set up a different NHS App message sender name for other messages, contact our onboarding team.',
    ],
  },
  form: {
    heading: 'What would you like to do next with this template?',
    options: [
      { id: 'nhsapp-edit', text: 'Edit' },
      { id: 'nhsapp-submit', text: 'Submit' },
    ],
  },
};

const previewTextMessageFormComponent = {
  sectionHeader: 'Text message template',
  details: {
    heading: 'Who your text message will be sent from',
    text: [
      'Set your text message sender name during onboarding.',
      'If you need to set up a different text message sender name for other messages, contact our onboarding team.',
    ],
  },
  form: {
    heading: 'What would you like to do next with this template?',
    options: [
      { id: 'sms-edit', text: 'Edit' },
      { id: 'sms-send', text: 'Send a test text message' },
      { id: 'sms-submit', text: 'Submit' },
    ],
  },
};

const previewMessageComponent = {
  legendText: 'What would you like to do next with this template?',
  buttonText: 'Continue',
};

const content = {
  global: {
    mainLayout,
  },
  components: {
    headerComponent,
    footerComponent,
    personalisationComponent,
    previewEmailFormComponent,
    previewLetterFormComponent,
    previewNHSAppFormComponent,
    previewTextMessageFormComponent,
    previewMessageComponent,
  },
  pages: {
    homePage,
  },
};

export const chooseTemplatePageContent = {
  pageHeading: 'Choose a template type to create',
  errorHeading: 'There is a problem',
  options: [
    { id: 'nhs-app', text: 'NHS App message' },
    { id: 'email', text: 'Email' },
    { id: 'sms', text: 'Text message (SMS)' },
    { id: 'letter', text: 'Letter' },
  ],
  buttonText: 'Continue',
};

export default content;
