import { getBasePath } from '@utils/get-base-path';
import { TemplateType } from 'nhs-notify-web-template-management-utils';

const headerComponent = {
  serviceName: 'Notify',
  links: {
    logIn: {
      text: 'Log in',
      href: `/auth?redirect=${encodeURIComponent(
        `${getBasePath()}/create-and-submit-templates`
      )}`,
    },
    logOut: 'Log out',
  },
};

const footerComponent = {
  nhsEngland: 'NHS England',
  supportLinks: 'Support links',
  links: {
    accessibilityStatement: {
      text: 'Accessibility statement',
      url: '/accessibility',
    },
    contactUs: 'Contact us',
    cookies: 'Cookies',
    privacyPolicy: 'Privacy policy',
    termsAndCondition: 'Terms and conditions',
  },
};

const personalisationComponent = {
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

const messageFormattingComponent = {
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

const homePage = {
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
  text5: 'You cannot save a template as a draft and edit it later.',
  text6:
    'If you want to change a submitted template, you must create a new template to replace it.',
  text7:
    'You can access this tool by signing in with your NHSmail account or Care Identity.',
  linkButton: {
    text: 'Start now',
    url: `${getBasePath()}/manage-templates`,
  },
};

const manageTemplates = {
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

const reviewEmailTemplateContent = {
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
};

const reviewNHSAppTemplateContent = {
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
};

const reviewSMSTemplateContent = {
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
};

const error404PageContent = {
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

export const submitTemplateContent = {
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

export const copyTemplatePageContent = {
  pageHeading: 'Copy',
  radiosLabel: 'Choose a template type',
  errorHeading: 'There is a problem',
  buttonText: 'Continue',
  hint: 'Select one option',
  backLinkText: 'Back to all templates',
};

export const chooseTemplatePageContent = {
  pageHeading: 'Choose a template type to create',
  errorHeading: 'There is a problem',
  buttonText: 'Continue',
  hint: 'Select one option',
  learnMoreLink: '/features',
  learnMoreText: 'Learn more about message channels (opens in a new tab)',
};

export const nameYourTemplateContent = {
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
    [TemplateType.NHS_APP]: `For example, 'NHS App - covid19 2023 - over 65s - version 3'`,
    [TemplateType.EMAIL]: `For example, 'Email - covid19 2023 - over 65s - version 3'`,
    [TemplateType.SMS]: `For example, 'SMS - covid19 2023 - over 65s - version 3'`,
  },
};

export const channelGuidanceContent = {
  [TemplateType.NHS_APP]: {
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
  [TemplateType.EMAIL]: {
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
  [TemplateType.SMS]: {
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
};

export const createNhsAppTemplatePageContent = {
  pageHeading: 'Create NHS App message template',
  errorHeading: 'There is a problem',
  templateNameLabelText: 'Template name',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  characterCountText: ' of 5000 characters',
  buttonText: 'Save and preview',
};

export const createEmailTemplatePageContent = {
  pageHeading: 'Create email template',
  errorHeading: 'There is a problem',
  templateNameLabelText: 'Template name',
  templateSubjectLineLabelText: 'Subject line',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  buttonText: 'Save and preview',
};

export const templateSubmittedPageContent = {
  pageHeading: 'Template submitted',
  templateNameHeading: 'Template name',
  templateIdHeading: 'Template ID',
  newTemplateText: 'Create another template',
  doNextHeading: 'What you need to do next',
  doNextText:
    "You'll receive a confirmation email, which contains the template name and ID.",
  notLiveHeading: "If you're currently onboarding",
  notLiveText:
    "Tell your onboarding manager once you've submitted all your templates.",
  liveHeading: "If you've already onboarded",
  liveText: "Once you've submitted all your templates",
  liveLinkText: 'raise a request with the service desk (opens in a new tab).',
};

export const createSmsTemplatePageContent = {
  pageHeading: 'Create text message template',
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
};

export const viewSubmittedTemplatePageContent = {
  cannotEdit: 'This template cannot be edited because it has been submitted.',
  createNewTemplate:
    'If you want to change a submitted or live template, you must create a new template to replace it.',
};

const content = {
  global: {
    mainLayout,
  },
  components: {
    headerComponent,
    footerComponent,
    personalisationComponent,
    reviewEmailTemplateContent,
    reviewNHSAppTemplateContent,
    reviewSMSTemplateContent,
    messageFormattingComponent,
  },
  pages: {
    homePage,
    error404PageContent,
    manageTemplates,
  },
};

export default content;
