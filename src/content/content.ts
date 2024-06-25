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
    personalisationComponent,
  },
  pages: {
    homePage,
  },
};

export default content;
