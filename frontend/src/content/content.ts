import { ContentBlock } from '@molecules/ContentRenderer/ContentRenderer';
import { getBasePath } from '@utils/get-base-path';
import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';

const generatePageTitle = (title: string): string => {
  return `${title} - NHS Notify`;
};

const goBackButtonText = 'Go back';
const enterATemplateName = 'Enter a template name';
const enterATemplateMessage = 'Enter a template message';
const templateMessageTooLong = 'Template message too long';
const selectAnOption = 'Select an option';

const header = {
  serviceName: 'Notify',
  logoLink: {
    ariaLabel: 'NHS Notify templates',
    logoTitle: 'NHS logo',
    href: '/message-templates',
  },
  accountInfo: {
    ariaLabel: 'Account',
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
  },
  navigationMenu: {
    ariaLabel: 'Menu',
    links: [
      {
        text: 'Templates',
        href: '/message-templates',
      },
      {
        text: 'Message plans',
        href: '/templates-and-message-plans/message-plans',
        feature: 'routing',
      },
    ],
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
    cookies: { text: 'Cookies', url: '/cookies' },
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

const errorSummary = {
  heading: 'There is a problem',
};

const personalisation: {
  header: string;
  leadParagraph: ContentBlock[];
  details: ExpandableDetailsContent[];
} = {
  header: 'Personalisation',
  leadParagraph: [
    {
      type: 'text',
      text: 'Use double brackets to add a personalisation field to your content.',
    },
    {
      type: 'text',
      text: 'Do not include spaces in your personalisation fields. For example:',
    },
    {
      type: 'code',
      code: 'Hello ((firstName)), your NHS number is ((nhsNumber))',
      aria: {
        text: 'An example of personalised message content:',
        id: 'personalisation-markdown-description',
      },
    },
  ],
  details: [
    {
      title: 'PDS personalisation fields',
      content: [
        {
          type: 'text',
          text: 'NHS Notify gets data from PDS to populate certain personalisation fields.',
        },
        {
          type: 'text',
          text: 'You can use the following PDS personalisation fields:',
        },
        {
          type: 'list',
          items: [
            '((fullName))',
            '((firstName))',
            '((lastName))',
            '((nhsNumber))',
            '((date))',
          ],
        },
        {
          type: 'text',
          text: 'Make sure your personalisation fields exactly match the PDS personalisation fields. This includes using the correct order of upper and lower case letters.',
        },
      ],
    },
    {
      title: 'Custom personalisation fields',
      content: [
        {
          type: 'text',
          text: 'You can add [custom personalisation fields](/using-nhs-notify/personalisation#custom-personalisation-fields) that use your own personalisation data.',
        },
        {
          type: 'text',
          text: 'Include custom personalisation fields in your content. Then provide your custom personalisation data using [NHS Notify API](/using-nhs-notify/api) or [NHS Notify MESH](/using-nhs-notify/mesh).',
        },
        {
          type: 'text',
          text: 'For example, if you wanted to include GP surgery as custom personalisation data, your custom personalisation field could be:',
        },
        {
          type: 'code',
          code: '((GP_surgery))',
          aria: {
            text: 'An example of personalised message content:',
            id: 'custom-personalisation-markdown-description',
          },
        },
        {
          type: 'text',
          text: 'Remember not to include spaces in your personalisation fields.',
        },
      ],
    },
  ],
};

type ExpandableDetailsContent = {
  title: string;
  content: ContentBlock[];
  showFor?: TemplateType[];
};

const messageFormatting: {
  header: string;
  details: ExpandableDetailsContent[];
} = {
  header: 'Message formatting',
  details: [
    {
      title: 'Line breaks and paragraphs',
      showFor: ['NHS_APP', 'EMAIL'],
      content: [
        {
          type: 'text',
          text: 'To add a line break, use 2 spaces at the end of your text.',
        },
        {
          type: 'text',
          text: 'Copy this example to add line breaks:',
        },
        {
          type: 'code',
          code: 'line 1  \nline 2  \nline 3  ',
          aria: {
            text: 'An example of line break markdown',
            id: 'linebreaks-markdown-description',
          },
        },
        {
          type: 'text',
          text: 'To add a paragraph, use a blank line between each paragraph.',
        },
        {
          type: 'text',
          text: 'Copy this example to add paragraphs:',
        },
        {
          type: 'code',
          code: 'line 1\n\nline 2\n\nline 3',
          aria: {
            text: 'An example of paragraph markdown',
            id: 'paragraphs-markdown-description',
          },
        },
      ],
    },
    {
      title: 'Headings',
      showFor: ['NHS_APP', 'EMAIL'],
      content: [
        {
          type: 'text',
          text: 'Use one hash symbol followed by a space for a heading.',
        },
        {
          type: 'text',
          text: 'Copy this example to add a heading:',
        },
        {
          type: 'code',
          code: '# This is a heading',
          aria: {
            text: 'An example of heading markdown',
            id: 'headings-markdown-description',
          },
        },
        {
          type: 'text',
          text: 'To add a subheading, use 2 hash symbols:',
        },
        {
          type: 'code',
          code: '## This is a subheading',
          aria: {
            text: 'An example of subheading markdown',
            id: 'subheadings-markdown-description',
          },
        },
      ],
    },
    {
      title: 'Bold text',
      showFor: ['NHS_APP'],
      content: [
        {
          type: 'text',
          text: 'Use two asterisk symbols on either side of the words you want to be bold.',
        },
        {
          type: 'text',
          text: 'Copy this example to add bold text:',
        },
        {
          type: 'code',
          code: '**this is bold text**',
          aria: {
            text: 'An example of bold text markdown',
            id: 'bold-text-markdown-description',
          },
        },
      ],
    },
    {
      title: 'Bullet points',
      showFor: ['NHS_APP', 'EMAIL'],
      content: [
        {
          type: 'text',
          text: 'Put each item on a separate line with an asterisk and a space in front of each one.',
        },
        {
          type: 'text',
          text: 'Leave an empty line before the first bullet point and after the last bullet point.',
        },
        {
          type: 'text',
          text: 'Copy this example to add bullet points:',
        },
        {
          type: 'code',
          code: '* bullet 1\n* bullet 2\n* bullet 3',
          aria: {
            text: 'An example of bullet point markdown',
            id: 'bullet-points-markdown-description',
          },
        },
      ],
    },
    {
      title: 'Numbered lists',
      showFor: ['NHS_APP', 'EMAIL'],
      content: [
        {
          type: 'text',
          text: 'Put each item on a separate line with the number, full stop and a space in front of each one.',
        },
        {
          type: 'text',
          text: 'Leave an empty line before the first item and after the last item.',
        },
        {
          type: 'text',
          text: 'Copy this example to add a numbered list:',
        },
        {
          type: 'code',
          code: '1. first item\n2. second item\n3. third item',
          aria: {
            text: 'An example of numbered list markdown',
            id: 'numbered-list-markdown-description',
          },
        },
      ],
    },

    {
      title: 'Horizontal lines',
      showFor: ['EMAIL'],
      content: [
        {
          type: 'text',
          text: 'To add a horizontal line between 2 paragraphs, use 3 dashes. Leave one empty line space after the first paragraph.',
        },
        {
          type: 'text',
          text: 'Copy this example to add a horizontal line:',
        },
        {
          type: 'code',
          code: 'First paragraph\n\n---\nSecond paragraph',
          aria: {
            text: 'An example of horizontal line markdown',
            id: 'horizontal-line-markdown-description',
          },
        },
      ],
    },
    {
      title: 'Links and URLs',
      showFor: ['NHS_APP', 'EMAIL'],
      content: [
        {
          type: 'text',
          text: 'To convert text into a link, use square brackets around the link text and round brackets around the full URL. Make sure there are no spaces between the brackets or the link will not work.',
        },
        {
          type: 'text',
          text: 'Copy this example to add a link:',
        },
        {
          type: 'code',
          code: '[Read more](https://www.nhs.uk/)',
          aria: {
            text: 'An example of link markdown',
            id: 'text-links-markdown-description',
          },
        },
        {
          type: 'text',
          text: 'If you want to include the URL in full, use square brackets around the full URL to make it the link text and use round brackets around the full URL.',
        },
        {
          type: 'text',
          text: 'Copy this example to add a URL:',
        },
        {
          type: 'code',
          code: '[https://www.nhs.uk/](https://www.nhs.uk/)',
          aria: {
            text: 'An example of URL markdown',
            id: 'full-urls-markdown-description',
          },
        },
      ],
    },
    {
      title: 'Links and URLs',
      showFor: ['SMS'],
      content: [
        {
          type: 'text',
          text: 'Write the URL in full, starting with https://',
        },
        {
          type: 'text',
          text: 'For example:',
        },
        {
          type: 'code',
          code: 'https://www.nhs.uk/example',
          aria: {
            text: 'An example of URL markdown',
            id: 'links-urls-markdown-description',
          },
        },
      ],
    },
  ],
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
  channelList: ['NHS App messages', 'emails', 'text messages (SMS)', 'letters'],
  text3:
    'When you submit a template, it will be used by NHS Notify to set up the messages you want to send.',
  pageSubHeading: 'Before you start',
  text4:
    'Only use this tool if your message content has been approved by the relevant stakeholders in your team.',
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
    action: { text: 'Action', copy: 'Copy', delete: 'Delete' },
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
    pageHeading: 'What would you like to do next?',
    options: [
      { id: 'email-edit', text: 'Edit template' },
      { id: 'email-submit', text: 'Submit template' },
    ],
    buttonText: 'Continue',
    previewEmailTemplateAction: {
      error: {
        empty: selectAnOption,
      },
    },
  },
  backLinkText: backToAllTemplates,
};

const previewLetterFooter: Partial<Record<TemplateStatus, string[]>> = {
  WAITING_FOR_PROOF: [
    'It can take 5 to 10 working days to get a proof of your template.',
    'If you still have not received your proof after this time, contact NHS Notify.',
  ],
};

const previewLetterPreSubmissionText = {
  ifDoesNotMatch: {
    summary: 'If this proof does not match the template',
    paragraphs: [
      "If the content or formatting of your proof does not match the template you originally provided, contact NHS Notify to describe what's wrong with the proof.",
      'NHS Notify will make the relevant changes and reproof your template.',
      'It can take 5 to 10 working days to get another proof of your template.',
      "If any personalisation does not appear how you expect, you may need to check if you're using the correct personalisation fields or if your example data is correct.",
    ],
  },
  ifNeedsEdit: {
    summary: 'If you need to edit the template',
    paragraph:
      'Edit your original template on your computer, convert it to PDF and then upload as a new template.',
  },
  ifYouAreHappyParagraph:
    "If you're happy with this proof, submit the template and NHS Notify will use it to set up the messages you want to send.",
};

const previewLetterTemplate = {
  pageTitle: generatePageTitle('Preview letter template'),
  backLinkText: backToAllTemplates,
  submitText: 'Submit template',
  requestProofText: 'Request a proof',
  footer: previewLetterFooter,
  virusScanError: 'The file(s) you uploaded may contain a virus.',
  virusScanErrorAction:
    'Create a new letter template to upload your file(s) again or upload different file(s).',
  validationError:
    'The personalisation fields in your files are missing or do not match.',
  validationErrorAction:
    'Check that the personalisation fields in your template file match the fields in your example personalisation file',
  preSubmissionText: previewLetterPreSubmissionText,
  rtlWarning: {
    heading: 'Important',
    text1: `The proof of this letter template will not be available online because of the language you've chosen.`,
    text2:
      'After you submit your template, our service team will send you a proof by email instead.',
    text3: 'This email will tell you what to do next.',
  },
};

const previewNHSAppTemplate = {
  pageTitle: generatePageTitle('Preview NHS App message template'),
  sectionHeading: 'Template saved',
  form: {
    pageHeading: 'What would you like to do next?',
    options: [
      { id: 'nhsapp-edit', text: 'Edit template' },
      { id: 'nhsapp-submit', text: 'Submit template' },
    ],
    buttonText: 'Continue',
    previewNHSAppTemplateAction: {
      error: {
        empty: selectAnOption,
      },
    },
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
    pageHeading: 'What would you like to do next?',
    options: [
      { id: 'sms-edit', text: 'Edit template' },
      { id: 'sms-submit', text: 'Submit template' },
    ],
    buttonText: 'Continue',
    previewSMSTemplateAction: {
      error: {
        empty: selectAnOption,
      },
    },
  },
  backLinkText: backToAllTemplates,
};

const previewTemplateStatusFootnote: Partial<Record<TemplateStatus, string>> = {
  PENDING_UPLOAD: 'Refresh the page to update the status',
  PENDING_VALIDATION: 'Refresh the page to update the status',
};

const previewTemplateDetails = {
  rowHeadings: {
    templateFile: 'Template file',
    templateId: 'Template ID',
    templateProofFiles: 'Template proof files',
    templateStatus: 'Status',
    templateType: 'Type',
    examplePersonalisationFile: 'Example personalisation file',
  },
  previewTemplateStatusFootnote,
  headerCaption: 'Template',
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

const invalidConfiguration = {
  pageTitle: generatePageTitle('Configuration error'),
  pageHeading: 'You cannot create letter templates yet',
  text: 'To get access, contact your onboarding manager and give them this error message:',
  insetText: 'Account needs a client ID and campaign ID',
  backLinkText: goBackButtonText,
};

const submitTemplate = {
  pageTitle: {
    NHS_APP: generatePageTitle('Submit NHS App template'),
    EMAIL: generatePageTitle('Submit email template'),
    SMS: generatePageTitle('Submit text template'),
    LETTER: generatePageTitle('Submit letter template'),
  },
  pageHeading: 'Submit',
  leadParagraph:
    'When you submit a template, it will be used by NHS Notify to set up the messages you want to send.',
  submitChecklistHeading: 'Before you submit',
  submitChecklistIntroduction: 'You should check that your template:',
  submitChecklistItems: [
    'is approved by the relevant stakeholders in your team',
    'does not have any spelling errors',
    'is formatted correctly',
  ],
  warningCalloutLabel: 'Important',
  warningCalloutText: `You cannot edit a template after you've submitted it. You can only replace it with a new template.`,
  goBackButtonText,
  buttonText: 'Submit template',
};

const submitLetterTemplate = {
  proofingFlagDisabled: {
    goBackButtonText: submitTemplate.goBackButtonText,
    buttonText: submitTemplate.buttonText,
    pageHeading: 'Submit',
    submitChecklistHeading: 'Before you submit',
    submitChecklistIntroduction: 'You should check that your template:',
    submitChecklistItems: submitTemplate.submitChecklistItems,
    afterSubmissionHeading: 'After you submit this template',
    afterSubmissionText: [
      'Our service team will send you a proof of this letter template by email.',
      'This email will also tell you what you need to do next.',
    ],
    goBackPath: 'preview-letter-template',
    warningCalloutLabel: 'Important',
    warningCalloutText: `You cannot edit a template after you've submitted it. You can only replace it with a new template.`,
  },
  pageHeading: 'Approve and submit',
  leadParagraph:
    'When you submit a letter template, it will be used by NHS Notify to set up the messages you want to send.',
  submitChecklistHeading: 'Before you submit this template',
  submitChecklistIntroduction: 'Check that your template proof:',
  submitChecklistItems: [
    'looks exactly as you expect your recipient to get it',
    'uses personalisation as you expect',
    'shows QR codes correctly (if used)',
  ],
  warningCalloutLabel: 'Important',
  warningCalloutText: `You cannot edit a template after you've approved and submitted it. You can only replace it with a new template.`,
  goBackPath: 'preview-letter-template',
  goBackButtonText: submitTemplate.goBackButtonText,
  buttonText: 'Approve and submit',
};

const copyTemplate = {
  pageHeading: 'Copy',
  radiosLabel: 'Choose a template type',
  buttonText: 'Continue',
  hint: 'Select one option',
  backLinkText: backToAllTemplates,
  form: {
    templateType: { error: 'Select a template type' },
  },
};

const chooseTemplate = {
  pageTitle: generatePageTitle('Choose a template type'),
  pageHeading: 'Choose a template type to create',
  buttonText: 'Continue',
  hint: 'Select one option',
  learnMoreLink: '/features',
  learnMoreText: 'Learn more about message channels (opens in a new tab)',
  backLinkText: backToAllTemplates,
  form: {
    templateType: { error: 'Select a template type' },
  },
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
      { text: 'Email messages (opens in a new tab)', link: '/features/emails' },
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
  LETTER: { heading: 'More about letters', guidanceLinks: [] },
};

const templateFormNhsApp = {
  pageTitle: generatePageTitle('Create NHS App message template'),
  editPageTitle: generatePageTitle('Edit NHS App message template'),
  pageHeadingSuffix: 'NHS App message template',
  templateNameLabelText: 'Template name',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  characterCountText: '{{characters}} of 5000 characters',
  buttonText: 'Save and preview',
  backLinkText: 'Back to choose a template type',
  form: {
    nhsAppTemplateName: {
      error: { empty: enterATemplateName },
    },
    nhsAppTemplateMessage: {
      error: {
        empty: enterATemplateMessage,
        max: templateMessageTooLong,
      },
    },
  },
};

const templateFormLetter = {
  backLinkText: 'Back to choose a template type',
  pageTitle: generatePageTitle('Upload a letter template'),
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
  templatePdfGuidanceLink: '/using-nhs-notify/upload-a-letter',
  templatePdfGuidanceLinkText:
    'Learn how to create letter templates to our specification (opens in a new tab)',
  templateCsvLabelText: 'Example personalisation CSV (optional)',
  templateCsvHintText:
    'If your letter template uses custom personalisation fields, upload your example personalisation data.',
  templateCsvGuidanceLink:
    '/using-nhs-notify/personalisation#providing-example-data',
  templateCsvGuidanceLinkText:
    'Learn how to provide example personalisation data (opens in a new tab)',
  buttonText: 'Save and upload',
  form: {
    letterTemplateName: {
      error: {
        empty: enterATemplateName,
      },
    },
    letterTemplateLetterType: {
      error: {
        empty: 'Choose a letter type',
      },
    },
    letterTemplateLanguage: {
      error: {
        empty: 'Choose a language',
      },
    },
    letterTemplatePdf: {
      error: {
        empty: 'Select a letter template PDF',
        tooLarge:
          'The letter template PDF is too large. The file must be smaller than 5MB',
        wrongFileFormat: 'Select a letter template PDF',
      },
    },
    letterTemplateCsv: {
      error: {
        empty: 'Select a valid test data .csv file',
        tooLarge:
          'The test data CSV is too large. The file must be smaller than 10KB',
        wrongFileFormat: 'Select a valid test data .csv file',
      },
    },
  },
  rtlWarning: {
    heading: 'Check your personalisation fields',
    bodyPart1:
      "We cannot automatically check if the personalisation fields in your PDF match the example data in your CSV file because of the language you've chosen.",
    bodyPart2: 'You must check they match before you save and upload.',
  },
};

const templateFormEmail = {
  pageTitle: generatePageTitle('Create email template'),
  editPageTitle: generatePageTitle('Edit email template'),
  pageHeadingSuffix: 'email template',
  templateNameLabelText: 'Template name',
  templateSubjectLineLabelText: 'Subject line',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  buttonText: 'Save and preview',
  backLinkText: 'Back to choose a template type',
  form: {
    emailTemplateName: {
      error: {
        empty: enterATemplateName,
      },
    },
    emailTemplateSubjectLine: {
      error: {
        empty: 'Enter a template subject line',
      },
    },
    emailTemplateMessage: {
      error: {
        empty: enterATemplateMessage,
        max: templateMessageTooLong,
      },
    },
  },
};

const smsTemplateFooter: ContentBlock[] = [
  {
    type: 'text',
    testId: 'character-message-count',
    text: `{{characters}} {{characters|character|characters}}  \nThis template will be sent as {{count}} {{count|text message|text messages}}.  \nIf you're using personalisation fields, it could send as more.`,
  },
  {
    type: 'text',
    testId: 'sms-pricing-info',
    text: '[Learn more about character counts and text messaging pricing (opens in a new tab)](/pricing/text-messages)',
  },
];

const templateFormSms = {
  pageTitle: generatePageTitle('Create text message template'),
  editPageTitle: generatePageTitle('Edit text message template'),
  pageHeadingSuffix: 'text message template',
  templateNameLabelText: 'Template name',
  templateMessageLabelText: 'Message',
  templateNameHintText: 'This will not be visible to recipients.',
  templateMessageFooterText: smsTemplateFooter,
  smsCountText1: 'This template will be sent as ',
  smsCountText2: ` text messages. If you're using personalisation fields, it could send as more.`,
  smsPricingLink: '/pricing/text-messages',
  smsPricingText:
    'Learn more about character counts and text messaging pricing (opens in a new tab)',
  buttonText: 'Save and preview',
  backLinkText: 'Back to choose a template type',
  form: {
    smsTemplateName: {
      error: {
        empty: enterATemplateName,
      },
    },
    smsTemplateMessage: {
      error: {
        empty: enterATemplateMessage,
        max: templateMessageTooLong,
      },
    },
  },
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
  doNextParagraphs: [
    {
      heading: "If you've not sent messages using NHS Notify yet",
      text: [
        "Tell your onboarding manager once you've submitted all your templates.",
        'If you replaced a template by submitting a new one, tell your onboarding manager which template you want to use.',
      ],
    },
    {
      heading: "If you've sent messages using NHS Notify",
      text: [
        "[Raise a request with the Service Desk (opens in a new tab)](https://nhsdigitallive.service-now.com/csm?id=sc_cat_item&sys_id=ce81c3ae1b1c5190892d4046b04bcb83) once you've submitted all your templates.",
        'If you replaced a template by submitting a new one, tell us which template you want to use in your Service Desk request.',
      ],
    },
  ],
  backLinkText: backToAllTemplates,
};

const viewSubmittedTemplate = {
  cannotEdit: 'This template cannot be edited because it has been submitted.',
  createNewTemplate:
    'If you want to change a submitted or live template, you must create a new template to replace it.',
  backLinkText: backToAllTemplates,
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

const requestProof = {
  pageTitle: generatePageTitle('Request a proof of your template'),
  heading: (templateName: string) => `Request a proof of '${templateName}'`,
  subHeading: 'Before you request a proof of this template',
  requirementsIntro:
    'You should only request a proof of the final version of a template you’ve created. This means that your template:',
  requirementsList: [
    'is approved by the relevant stakeholders in your team',
    'does not have any spelling errors',
    'is formatted correctly',
  ],
  checkTestData:
    'If your template uses personalisation, check that you’ve uploaded your example personalisation data.',
  waitTime: 'It can take 5 to 10 working days to get a proof of your template.',
  buttons: {
    confirm: 'Request a proof',
    back: goBackButtonText,
  },
};

const previewDigitalTemplate = {
  editButton: 'Edit template',
};

const content = {
  global: { mainLayout },
  components: {
    channelGuidance,
    chooseTemplate,
    copyTemplate,
    deleteTemplate,
    errorSummary,
    footer,
    header,
    logoutWarning,
    messageFormatting,
    nameYourTemplate,
    personalisation,
    previewDigitalTemplate,
    previewEmailTemplate,
    previewLetterTemplate,
    previewNHSAppTemplate,
    previewSMSTemplate,
    previewTemplateDetails,
    requestProof,
    submitLetterTemplate,
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
    invalidConfiguration,
    messageTemplates,
  },
};

export default content;
