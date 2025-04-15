import { getBasePath } from '@utils/get-base-path';

const generatePageTitle = (title: string): string => {
  return `${title} - NHS Notify`;
};

const header = {
  serviceName: 'Notify',
  links: {
    signIn: {
      text: 'Sign in',
      href: `/auth?redirect=${encodeURIComponent(
        `${getBasePath()}/create-and-submit-templates`
      )}`,
    },
    signOut: {
      text: 'Sign out',
      href: '/auth/signout',
    },
  },
};

const footer = {
  nhsEngland: 'NHS England',
  supportLinks: 'Support links',
  links: {
    acceptableUsePolicy: {
      text: 'Acceptable use policy',
      url: 'https://digital.nhs.uk/services/nhs-notify/acceptable-use-policy',
    },
    accessibilityStatement: {
      text: 'Accessibility statement',
      url: '/accessibility',
    },
    cookies: {
      text: 'Cookies',
      url: '/cookies',
    },
    privacy: {
      text: 'Privacy',
      url: 'https://digital.nhs.uk/services/nhs-notify/transparency-notice',
    },
    termsAndConditions: {
      text: 'Terms and conditions',
      url: 'https://digital.nhs.uk/services/nhs-notify/terms-and-conditions',
    },
  },
};

const personalisation = {
  header: 'Personalisation',
  details: {
    title: 'Personalisation fields',
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

const messageFormatting = {
  header: 'Message formatting',
  lineBreaksAndParagraphs: {
    title: 'Line breaks and paragraphs',
    text1:
      'To add a line break, use 2 spaces at the end of your text, for example:',
    codeBlockText: [
      { id: 'line-1', item: 'line 1' },
      { id: 'line-2', item: 'line 2' },
      { id: 'line-3', item: 'line 3' },
    ],
    text2:
      'To add a paragraph, use a blank line between each paragraph, for example:',
  },
  headings: {
    title: 'Headings',
    text1:
      'Use one hash symbol followed by a space for a heading, for example:',
    text2: 'To add a subheading, use 2 hash symbols:',
    codeBlock: {
      text1: '# This is a heading',
      text2: '## This is a subheading',
    },
  },
  boldText: {
    title: 'Bold text',
    text: 'Use two asterisk symbols on either side of the words you want to be bold, for example:',
    codeBlockText: '**this is bold text**',
  },
  linksAndUrls: {
    title: 'Links and URLs',
    text1:
      'If the recipient is not expecting to receive a message from you, write the URL in full, starting with https://',
    text2: 'For example:',
    text3:
      'To convert text into a link, use square brackets around the link text and round brackets around the full URL. Make sure there are no spaces between the brackets or the link will not work.',
    text4: 'For example:',
    codeBlockText: {
      text1: 'https://www.nhs.uk/example',
      text2: '[Read more](https://www.nhs.uk/)',
    },
  },
  bulletLists: {
    title: 'Bullet points',
    text: 'Put each item on a separate line with an asterisk and a space in front of each one, for example:',
    codeBlockText: [
      {
        id: 'bullet-1',
        item: '* bullet 1',
      },
      {
        id: 'bullet-2',
        item: '* bullet 2',
      },
      {
        id: 'bullet-3',
        item: '* bullet 3',
      },
    ],
  },
  numberedLists: {
    title: 'Numbered lists',
    text: 'Put each item on a separate line with the number, full stop and a space in front of each one, for example:',
    codeBlockText: [
      {
        id: 'first-item',
        item: '1. first item',
      },
      {
        id: 'second-item',
        item: '2. second item',
      },
      {
        id: 'third-item',
        item: '3. third item',
      },
    ],
  },
  horizontalLine: {
    title: 'Horizontal lines',
    text: 'To add a horizontal line between 2 paragraphs, use 3 dashes. Leave one empty line space after the first paragraph. For example:',
    codeBlockText: [
      { id: 'hr-1', item: 'First paragraph' },
      { id: 'hr-2', item: '---' },
      { id: 'hr-3', item: 'Second paragraph' },
    ],
  },
  qrCodes: {},
};

const mainLayout = {
  title: 'NHS Notify - Template Management',
  description: 'Template management',
};

const backToAllTemplates = 'Back to all templates';

const homePage = {
  pageTitle: generatePageTitle('Create and submit templates'),
  pageHeading: 'Create and submit a template to NHS Notify',
  text1:
    'Use this tool to create and submit templates you want to send as messages using NHS Notify.',
  text2: 'You can create templates for:',
  list: [
    { key: 'template-1', item: 'NHS App messages' },
    { key: 'template-2', item: 'emails' },
    { key: 'template-3', item: 'text messages (SMS)' },
  ],
  text3:
    'When you submit a template, it will be used by NHS Notify to set up the messages you want to send.',
  pageSubHeading: 'Before you start',
  text4:
    'Only use this tool if your message content has been signed off by the relevant stakeholders in your team.',
  text5: 'You can save a template as a draft and edit it later.',
  text6:
    'If you want to change a submitted template, you must create a new template to replace it.',
  text7: 'You can access this tool by signing in with your Care Identity.',
  linkButton: {
    text: 'Start now',
    url: `${getBasePath()}/message-templates`,
  },
};

const messageTemplates = {
  pageTitle: generatePageTitle('Message templates'),
  pageHeading: 'Message templates',
  emptyTemplates: 'You do not have any templates yet.',
  listOfTemplates: 'List of templates',
  tableHeadings: {
    name: 'Name',
    type: 'Type',
    status: 'Status',
    dateCreated: 'Date created',
    action: {
      text: 'Action',
      copy: 'Copy',
      delete: 'Delete',
    },
  },
  createTemplateButton: {
    text: 'Create template',
    url: `${getBasePath()}/choose-a-template-type`,
  },
};

const previewEmailTemplate = {
  pageTitle: generatePageTitle('Preview email template'),
  sectionHeading: 'Template saved',
  form: {
    errorHeading: 'There is a problem',
    pageHeading: 'What would you like to do next?',
    options: [
      { id: 'email-edit', text: 'Edit template' },
      { id: 'email-submit', text: 'Submit template' },
    ],
    buttonText: 'Continue',
  },
  backLinkText: backToAllTemplates,
};

const previewLetterTemplate = {
  backLinkText: backToAllTemplates,
  buttonText: 'Submit template',
};

const previewNHSAppTemplate = {
  pageTitle: generatePageTitle('Preview NHS App message template'),
  sectionHeading: 'Template saved',
  form: {
    errorHeading: 'There is a problem',
    pageHeading: 'What would you like to do next?',
    options: [
      { id: 'nhsapp-edit', text: 'Edit template' },
      { id: 'nhsapp-submit', text: 'Submit template' },
    ],
    buttonText: 'Continue',
  },
  backLinkText: backToAllTemplates,
};

const previewSMSTemplate = {
  pageTitle: generatePageTitle('Preview text message template'),
  sectionHeading: 'Template saved',
  details: {
    heading: 'Who your text message will be sent from',
    text: [
      {
        id: 'sms-text-1',
        text: 'Set your text message sender name during onboarding.',
      },
      {
        id: 'sms-text-2',
        text: 'If you need to set up a different text message sender name for other messages, contact our onboarding team.',
      },
    ],
  },
  form: {
    errorHeading: 'There is a problem',
    pageHeading: 'What would you like to do next?',
    options: [
      { id: 'sms-edit', text: 'Edit template' },
      { id: 'sms-submit', text: 'Submit template' },
    ],
    buttonText: 'Continue',
  },
  backLinkText: backToAllTemplates,
};

const previewTemplateDetails = {
  rowHeadings: {
    templateId: 'Template ID',
    templateType: 'Type',
    templateStatus: 'Status',
  },
};

const error404 = {
  pageHeading: 'Sorry, we could not find that page',
  p1: 'You may have typed or pasted a web address incorrectly. ',
  backLink: {
    text: 'Go to the start page.',
    path: '/create-and-submit-templates',
  },
  p2: 'If the web address is correct or you selected a link or button, contact us to let us know there is a problem with this page:',
  contact1: {
    header: 'By email',
    href: 'mailto:ssd.nationalservicedesk@nhs.net',
    contactDetail: 'ssd.nationalservicedesk@nhs.net',
  },
};

const submitTemplate = {
  pageTitle: {
    NHS_APP: generatePageTitle('Submit NHS App template'),
    EMAIL: generatePageTitle('Submit email template'),
    SMS: generatePageTitle('Submit text template'),
    LETTER: generatePageTitle('Submit letter template'),
  },
  pageHeading: 'Submit',
  warningCalloutLabel: 'Important',
  warningCalloutText:
    'When you submit this template it cannot be changed. It can only be replaced by a new template.',
  submitChecklistHeading: 'Before you submit',
  submitChecklistIntroduction: 'You should check that your template:',
  submitChecklistItems: [
    'is signed off by the relevant stakeholders in your team',
    'does not have any spelling errors',
    'is formatted correctly',
  ],
  submitChecklistParagraphs: [
    'When you submit a template, it will be used by NHS Notify to set up the messages you want to send.',
    'If you want to change a submitted template, you must create and submit a new template to replace it.',
  ],
  goBackButtonText: 'Go back',
  buttonText: 'Submit template',
};

const copyTemplate = {
  pageHeading: 'Copy',
  radiosLabel: 'Choose a template type',
  errorHeading: 'There is a problem',
  buttonText: 'Continue',
  hint: 'Select one option',
  backLinkText: backToAllTemplates,
};

const chooseTemplate = {
  pageTitle: generatePageTitle('Choose a template type'),
  pageHeading: 'Choose a template type to create',
  errorHeading: 'There is a problem',
  buttonText: 'Continue',
  hint: 'Select one option',
  learnMoreLink: '/features',
  learnMoreText: 'Learn more about message channels (opens in a new tab)',
  backLinkText: backToAllTemplates,
};

const nameYourTemplate = {
  templateNameDetailsSummary: 'Naming your templates',
  templateNameDetailsOpeningParagraph:
    'You should name your templates in a way that works best for your service or organisation.',
  templateNameDetailsListHeader: 'Common template names include the:',
  templateNameDetailsList: [
    { id: `template-name-details-item-1`, text: 'message channel it uses' },
    {
      id: `template-name-details-item-2`,
      text: 'subject or reason for the message',
    },
    {
      id: `template-name-details-item-3`,
      text: 'intended audience for the template',
    },
    {
      id: `template-name-details-item-4`,
      text: 'version number of the template',
    },
  ],
  templateNameDetailsExample: {
    NHS_APP: `For example, 'NHS App - covid19 2023 - over 65s - version 3'`,
    EMAIL: `For example, 'Email - covid19 2023 - over 65s - version 3'`,
    SMS: `For example, 'SMS - covid19 2023 - over 65s - version 3'`,
    LETTER: `For example, 'Letter - covid19 2023 - over 65s - version 3'`,
  },
};

const channelGuidance = {
  NHS_APP: {
    heading: 'More about NHS App messages',
    guidanceLinks: [
      {
        text: 'NHS App messages (opens in a new tab)',
        link: '/features/nhs-app-messages',
      },
      {
        text: 'Sender IDs (opens in a new tab)',
        link: '/using-nhs-notify/tell-recipients-who-your-messages-are-from',
      },
      {
        text: 'Delivery times (opens in a new tab)',
        link: '/using-nhs-notify/delivery-times',
      },
    ],
  },
  EMAIL: {
    heading: 'More about emails',
    guidanceLinks: [
      {
        text: 'Email messages (opens in a new tab)',
        link: '/features/emails',
      },
      {
        text: 'From and reply-to addresses (opens in a new tab)',
        link: '/using-nhs-notify/tell-recipients-who-your-messages-are-from',
      },
      {
        text: 'Delivery times (opens in a new tab)',
        link: '/using-nhs-notify/delivery-times',
      },
    ],
  },
  SMS: {
    heading: 'More about text messages',
    guidanceLinks: [
      {
        text: 'Text message length and pricing (opens in a new tab)',
        link: '/pricing/text-messages',
      },
      {
        text: 'Sender IDs (opens in a new tab)',
        link: '/using-nhs-notify/tell-recipients-who-your-messages-are-from',
      },
      {
        text: 'Delivery times (opens in a new tab)',
        link: '/using-nhs-notify/delivery-times',
      },
    ],
  },
  LETTER: {
    heading: 'More about letters',
    guidanceLinks: [],
  },
};

const templateFormNhsApp = {
  pageTitle: generatePageTitle('Create NHS App message template'),
  editPageTitle: generatePageTitle('Edit NHS App message template'),
  pageHeadingSuffix: 'NHS App message template',
  errorHeading: 'There is a problem',
  templateNameLabelText: 'Template name',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  characterCountText: ' of 5000 characters',
  buttonText: 'Save and preview',
  backLinkText: 'Back to choose a template type',
};

const templateFormLetter = {
  backLinkText: 'Back to choose a template type',
  errorHeading: 'There is a problem',
  pageHeading: 'Upload a letter template',
  templateNameLabelText: 'Template name',
  templateNameHintText: 'This will not be visible to recipients.',
  templateTypeLabelText: 'Letter type',
  templateTypeHintText: 'Choose the type of letter template you are uploading',
  templateLanguageLabelText: 'Letter language',
  templateLanguageHintText: 'Choose the language of this letter template',
  templatePdfLabelText: 'Letter template PDF',
  templatePdfHintText:
    'Your letter must follow our letter specification and be no bigger than 5MB',
  templatePdfGuidanceLink: '/using-nhs-notify/letter-templates',
  templatePdfGuidanceLinkText:
    'Learn how to create letter templates to our specification (opens in a new tab)',
  templateCsvLabelText: 'Text personalisation CSV (optional)',
  templateCsvHintText:
    'If your letter template uses personalisation, upload your test personalisation data.',
  templateCsvGuidanceLink:
    '/using-nhs-notify/personalisation#providing-example-data',
  templateCsvGuidanceLinkText:
    'Learn how to provide test personalisation data (opens in a new tab)',
  buttonText: 'Save and upload',
};

const templateFormEmail = {
  pageTitle: generatePageTitle('Create email template'),
  editPageTitle: generatePageTitle('Edit email template'),
  pageHeadingSuffix: 'email template',
  errorHeading: 'There is a problem',
  templateNameLabelText: 'Template name',
  templateSubjectLineLabelText: 'Subject line',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  buttonText: 'Save and preview',
  backLinkText: 'Back to choose a template type',
};

const templateFormSms = {
  pageTitle: generatePageTitle('Create text message template'),
  editPageTitle: generatePageTitle('Edit text message template'),
  pageHeadingSuffix: 'text message template',
  errorHeading: 'There is a problem',
  templateNameLabelText: 'Template name',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  smsCountText1: 'This template will be sent as ',
  smsCountText2: ` text messages. If you're using personalisation fields, it could send as more.`,
  smsPricingLink: '/pricing/text-messages',
  smsPricingText:
    'Learn more about character counts and text messaging pricing (opens in a new tab)',
  buttonText: 'Save and preview',
  backLinkText: 'Back to choose a template type',
};

const templateSubmitted = {
  pageTitle: {
    NHS_APP: generatePageTitle('NHS App template submitted'),
    EMAIL: generatePageTitle('Email template submitted'),
    SMS: generatePageTitle('Text template submitted'),
    LETTER: generatePageTitle('Letter template submitted'),
  },
  pageHeading: 'Template submitted',
  templateNameHeading: 'Template name',
  templateIdHeading: 'Template ID',
  doNextHeading: 'What you need to do next',
  doNextText:
    "Tell an onboarding manager once you've submitted all your templates.",
  backLinkText: backToAllTemplates,
};

const viewSubmittedTemplate = {
  cannotEdit: 'This template cannot be edited because it has been submitted.',
  createNewTemplate:
    'If you want to change a submitted or live template, you must create a new template to replace it.',
};

const deleteTemplate = {
  pageHeading: 'Are you sure you want to delete the template',
  hintText: "The template will be removed and you won't be able to recover it.",
  noButtonText: 'No, go back',
  yesButtonText: 'Yes, delete template',
};

const logoutWarning = {
  heading: "For security reasons, you'll be signed out in",
  signIn: 'Stay signed in',
  body: "If you're signed out, any unsaved changes will be lost.",
};

const content = {
  global: {
    mainLayout,
  },
  components: {
    channelGuidance,
    chooseTemplate,
    copyTemplate,
    deleteTemplate,
    footer,
    header,
    logoutWarning,
    messageFormatting,
    nameYourTemplate,
    personalisation,
    previewEmailTemplate,
    previewLetterTemplate,
    previewNHSAppTemplate,
    previewSMSTemplate,
    previewTemplateDetails,
    submitTemplate,
    templateFormEmail,
    templateFormLetter,
    templateFormNhsApp,
    templateFormSms,
    templateSubmitted,
    viewSubmittedTemplate,
  },
  pages: {
    homePage,
    error404,
    messageTemplates,
  },
};

export default content;
