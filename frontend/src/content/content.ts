import type {
  LetterType,
  RoutingConfigStatusActive,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';

import type { ContentBlock } from '@molecules/ContentRenderer/ContentRenderer';
import { getBasePath } from '@utils/get-base-path';
import { markdownList } from '@utils/markdown-list';

const generatePageTitle = (title: string): string => {
  return `${title} - NHS Notify`;
};

const goBackButtonText = 'Go back';
const enterATemplateName = 'Enter a template name';
const enterATemplateMessage = 'Enter a template message';
const templateMessageTooLong = 'Template message too long';
const templateMessageHasInsecureLink = 'URLs must start with https://';
const selectAnOption = 'Select an option';

export const templateMessageContainsInvalidPersonalisationErrorText =
  'You cannot use the following custom personalisation fields in your message:';

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
        href: '/message-plans',
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
  ] satisfies ContentBlock[],
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
          type: 'text',
          text: markdownList('ul', [
            '((fullName))',
            '((firstName))',
            '((lastName))',
            '((nhsNumber))',
          ]),
        },
        {
          type: 'text',
          text: 'Make sure your personalisation fields exactly match the PDS personalisation fields. This includes using the correct order of upper and lower case letters.',
        },
      ] satisfies ContentBlock[],
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
      ] satisfies ContentBlock[],
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
    id: 'ID',
    type: 'Type',
    status: 'Status',
    lastEdited: 'Last edited',
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
    paragraphsSubmit: [
      "If the content or formatting of your proof does not match the template you originally provided, contact NHS Notify to describe what's wrong with the proof.",
      'NHS Notify will make the relevant changes and reproof your template.',
      'It can take 5 to 10 working days to get another proof of your template.',
      "If any personalisation does not appear how you expect, you may need to check if you're using the correct personalisation fields or if your example data is correct.",
    ],
    paragraphsApproval: [
      "If the content or formatting of your template proof does not match the template you originally provided, contact us to describe what's wrong with the template proof.",
      "We'll update the template proof and email it to you.",
      'It can take 5 to 10 working days to get another proof of your template.',
      "If any personalisation does not appear how you expect, you may need to check if you're using the correct personalisation fields or if your example data is correct.",
    ],
  },
  ifNeedsEdit: {
    summary: 'If you need to edit the template',
    paragraph:
      'Edit your original template on your computer, convert it to PDF and then upload as a new template.',
  },
  ifYouAreHappyParagraphSubmit:
    "If you're happy with this proof, submit the template and NHS Notify will use it to set up the messages you want to send.",
  ifYouAreHappyParagraphApproval:
    "If you're happy with this template proof, approve it. Then your template will be ready to add to a message plan.",
};

const previewLetterTemplate = {
  pageTitle: generatePageTitle('Preview letter template'),
  backLinkText: backToAllTemplates,
  submitText: 'Submit template',
  approveProofText: 'Approve template proof',
  requestProofText: 'Request a proof',
  footer: previewLetterFooter,
  virusScanError: 'The file(s) you uploaded may contain a virus.',
  virusScanErrorAction:
    'Create a new letter template to upload your file(s) again or upload different file(s).',
  validationError:
    'The personalisation fields in your files are missing or do not match.',
  validationErrorAction:
    'Check that the personalisation fields in your template file match the fields in your example personalisation file',
  validationErrorMessages: {
    MISSING_ADDRESS_LINES: [
      'The template file you uploaded does not contain the address fields.',
      'Add the address fields to the template file and upload it.',
    ],
    VIRUS_SCAN_FAILED: [
      'The file(s) you uploaded may contain a virus.',
      'Create a new letter template to upload your file(s) again or upload different file(s).',
    ],
  } satisfies Record<string, string[]>,
  preSubmissionText: previewLetterPreSubmissionText,
  rtlWarning: {
    heading: 'Important',
    text1: `The proof of this letter template will not be available online because of the language you've chosen.`,
    text2:
      'After you submit your template, our service team will send you a proof by email instead.',
    text3: 'This email will tell you what to do next.',
  },
  links: {
    messageTemplates: '/message-templates',
    submitLetterTemplate:
      '{{basePath}}/submit-letter-template/{{templateId}}?lockNumber={{lockNumber}}',
    requestProofOfTemplate:
      '{{basePath}}/request-proof-of-template/{{templateId}}?lockNumber={{lockNumber}}',
  },
};

const letterRender = {
  heading: 'Letter preview',
  guidance: 'Check how your personalisation fields will appear in your letter.',
  learnMoreLink: {
    href: 'https://notify.nhs.uk/using-nhs-notify/personalisation',
    text: 'Learn more about personalising your letters (opens in a new tab)',
  },
  tabTitle: 'Example personalisation data',
  tabs: {
    short: 'Short examples',
    long: 'Long examples',
  },
  pdsSection: {
    heading: 'PDS personalisation fields',
    hint: 'The PDS fields will be pre-filled with example data when you choose a test recipient.',
    recipientLabel: 'Example recipient',
    recipientPlaceholder: 'Select a recipient',
    error: {
      invalid: 'Select an example recipient',
    },
  },
  customSection: {
    heading: 'Custom personalisation fields',
  },
  updatePreviewButton: 'Update preview',
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
    campaignId: 'Campaign',
    templateProofFiles: 'Template proof files',
    templateStatus: 'Status',
    templateType: 'Template type',
    examplePersonalisationFile: 'Example personalisation file',
    letterType: 'Letter type',
    totalPages: 'Total pages',
    sheets: 'Sheets',
    printingAndPostage: 'Printing and postage',
  },
  actions: {
    editName: 'Edit name',
    edit: 'Edit',
    learnMore: 'Learn more',
  },
  visuallyHidden: {
    campaign: 'campaign',
    sheets: 'about sheets',
    printingAndPostage: 'printing and postage',
    status: 'about status',
  },
  externalLinks: {
    lettersPricing: 'https://notify.nhs.uk/pricing-and-commercial/letters',
    templateStatuses:
      'https://notify.nhs.uk/templates/what-template-statuses-mean',
  },
  links: {
    editTemplateName: '/edit-template-name/{{templateId}}',
    editTemplateCampaign: '/edit-template-campaign/{{templateId}}',
    choosePrintingAndPostage: '/choose-printing-and-postage/{{templateId}}',
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

const letterTemplateInvalidConfiguration = {
  title: generatePageTitle('Configuration error'),
  heading: 'You cannot create letter templates yet',
  text: 'To get access, contact your onboarding manager and give them this error message:',
  insetText: 'Account needs a client ID and campaign ID',
  backLinkText: goBackButtonText,
  backLinkUrl: '/choose-a-template-type',
};

const messagePlanInvalidConfiguration = {
  title: generatePageTitle('Configuration error'),
  heading: 'You cannot create message plans yet',
  text: 'To get access, contact your onboarding manager and give them this error message:',
  insetText: 'Account needs a campaign ID',
  backLinkText: goBackButtonText,
  backLinkUrl: '/message-plans',
};

const deleteTemplateErrorPage = {
  pageTitle: generatePageTitle('Delete template error'),
  pageHeading: "You cannot delete the template '{{templateName}}'",
  intro: 'The template is linked to these message plans:',
  guidance:
    'You need to unlink it from each message plan before you can delete it.',
  backLinkText: goBackButtonText,
  backLinkUrl: '/message-templates',
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
    continueButtonText: submitTemplate.buttonText,
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
  routingFlagEnabled: {
    pageHeading: 'Approve',
    leadParagraph:
      'When you approve your template proof, your template will be ready to add to a message plan.',
    submitChecklistHeading: 'Before you approve this template proof',
    warningCalloutText: `You cannot edit a template after you've approved the template proof. You can only create a new template to replace it.`,
    continueButtonText: 'Approve template proof',
  },
  routingFlagDisabled: {
    pageHeading: 'Approve and submit',
    leadParagraph:
      'When you submit a letter template, it will be used by NHS Notify to set up the messages you want to send.',
    submitChecklistHeading: 'Before you submit this template',
    warningCalloutText: `You cannot edit a template after you've approved and submitted it. You can only replace it with a new template.`,
    continueButtonText: 'Approve and submit',
  },
  submitChecklistIntroduction: 'Check that your template proof:',
  submitChecklistItems: [
    'looks exactly as you expect your recipient to get it',
    'uses personalisation as you expect',
    'shows QR codes correctly (if used)',
  ],
  warningCalloutLabel: 'Important',
  goBackPath: 'preview-letter-template',
  goBackButtonText: submitTemplate.goBackButtonText,
};

const submitLetterTemplatePage = {
  routingFlagEnabled: {
    pageTitle: generatePageTitle('Approve letter template proof'),
  },
  routingFlagDisabled: {
    pageTitle: generatePageTitle('Submit letter template'),
  },
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

const chooseTemplateType = {
  pageTitle: generatePageTitle('Choose a template type'),
  pageHeading: 'Choose a template type to create',
  buttonText: 'Continue',
  hint: 'Select one option',
  learnMoreLink: '/features',
  learnMoreText: 'Learn more about message channels (opens in a new tab)',
  backLinkText: backToAllTemplates,
  form: {
    templateType: {
      error: 'Select a template type',
      errorHint: 'You have not chosen a template type',
    },
    letterType: {
      error: 'Select a letter template type',
      errorHint: 'You have not chosen a letter template type',
    },
  },
  templateTypes: {
    NHS_APP: 'NHS App message',
    SMS: 'Text message (SMS)',
    EMAIL: 'Email',
    LETTER: 'Letter',
  },
  letterTypes: {
    q4: 'British Sign Language letter',
    x0: 'Standard English letter',
    x1: 'Large print letter',
    language: 'Other language letter',
  },
};

const templateNameGuidance = (type?: TemplateType) => {
  const channelNames: Record<TemplateType, string> = {
    NHS_APP: 'NHS App',
    EMAIL: 'Email',
    SMS: 'SMS',
    LETTER: 'Letter',
  };

  const baseNameComponents = [
    'subject or reason for the message',
    'intended audience for the template',
    'version number of the template',
  ];

  const nameComponentsList = type
    ? ['message channel it uses', ...baseNameComponents]
    : baseNameComponents;

  const exampleText = type
    ? `For example, '${channelNames[type]} - covid19 2023 - over 65s - version 3'`
    : `For example, 'Covid19 2025 - over 65s - version 3'`;

  return {
    summary: 'Naming your templates',
    text: [
      {
        type: 'text',
        text: 'You should name your templates in a way that works best for your service or organisation.',
      },
      {
        type: 'text',
        text: 'Common template names include the:',
      },
      {
        type: 'text',
        text: markdownList('ul', nameComponentsList),
      },
      {
        type: 'text',
        text: exampleText,
      },
    ] satisfies ContentBlock[],
  };
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
        insecureLink: templateMessageHasInsecureLink,
        invalidUrlCharacter: 'URLs cannot include the symbols < or >',
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
  campaignLabelText: 'Campaign',
  singleCampaignHintText: 'You currently only have one campaign:',
  multiCampaignHintText: 'Choose which campaign this letter is for',
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
    letterTemplateCampaignId: {
      error: {
        empty: 'Choose a campaign ID',
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
        insecureLink: templateMessageHasInsecureLink,
      },
    },
  },
};

const smsTemplateFooter: ContentBlock[] = [
  {
    type: 'text',
    text: `{{characters}} {{characters|character|characters}}  \nThis template will be charged as {{count}} {{count|text message|text messages}}.  \nIf you're using personalisation fields, it could be charged as more.`,
    overrides: {
      p: {
        props: {
          'data-testid': 'character-message-count',
        },
      },
    },
  },
  {
    type: 'text',
    text: '[Learn more about character counts and text messaging pricing (opens in a new tab)](/pricing/text-messages)',
    overrides: {
      p: {
        props: {
          'data-testid': 'sms-pricing-info',
        },
      },
    },
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
        insecureLink: templateMessageHasInsecureLink,
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
  backLink: {
    href: '/message-templates',
    text: backToAllTemplates,
  },
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

const messagePlanFallbackConditions: Record<
  TemplateType,
  FallbackConditionBlock
> = {
  NHS_APP: {
    title: 'Fallback conditions',
    content: {
      stop: 'If {{ordinal}} message read within 24 hours, no further messages sent.',
      continue:
        'If {{ordinal}} message not read within 24 hours, {{nextOrdinal}} message sent.',
    },
  },
  SMS: {
    title: 'Fallback conditions',
    content: {
      stop: 'If {{ordinal}} message delivered within 72 hours, no further messages sent.',
      continue:
        'If {{ordinal}} message not delivered within 72 hours, {{nextOrdinal}} message sent.',
    },
  },
  EMAIL: {
    title: 'Fallback conditions',
    content: {
      stop: 'If {{ordinal}} message delivered within 72 hours, no further messages sent.',
      continue:
        'If {{ordinal}} message not delivered within 72 hours, {{nextOrdinal}} message sent.',
    },
  },
  LETTER: {
    title: 'Conditions for accessible and language letters',
    content: {
      continue: [
        {
          type: 'inline-text',
          text: 'The relevant accessible or language letter will be sent instead of the standard English letter if, both: ',
        },
        {
          type: 'text',
          text: markdownList('ul', [
            'the recipient has requested an accessible or language letter in PDS',
            `you've included the relevant template in this message plan`,
          ]),
        },
      ],
    },
  },
};

const messagePlanConditionalLetterTemplates = {
  languageFormats: 'Other language letters',
};

const chooseTemplatesForMessagePlan = {
  pageTitle: generatePageTitle('Choose templates for your message plan'),
  headerCaption: 'Message plan',
  changeNameLink: {
    href: '/message-plans/edit-message-plan-settings/{{routingConfigId}}',
    text: 'Edit settings',
  },
  rowHeadings: {
    routingPlanId: 'Routing Plan ID',
    campaignId: 'Campaign',
    status: 'Status',
  },
  ctas: {
    primary: {
      text: 'Move to production',
    },
    secondary: {
      href: '/message-plans',
      text: 'Save and close',
    },
  },
  validationError: {
    hintText: 'You must choose a template for each message.',
    linkText: 'You have not chosen a template for your {{ordinal}} message',
  },
  messagePlanFallbackConditions,
  messagePlanConditionalLetterTemplates,
};

export type FallbackConditionBlock = {
  title: string;
  content: {
    stop?: string | ContentBlock[];
    continue?: string | ContentBlock[];
  };
};

const messagePlanChannelTemplate = {
  templateLinks: {
    choose: 'Choose',
    change: 'Change',
    remove: 'Remove{{templateCount|| all}}',
    templateWord: '{{templateCount|template|templates}}',
  },
};

const messagePlanBlock = {
  title: '{{ordinal}} message',
};

const chooseNhsAppTemplate = {
  pageTitle: generatePageTitle('Choose an NHS App template'),
  pageHeading: 'Choose an NHS App template',
  noTemplatesText: 'You do not have any NHS App templates yet.',
};

const chooseEmailTemplate = {
  pageTitle: generatePageTitle('Choose an email template'),
  pageHeading: 'Choose an email template',
  noTemplatesText: 'You do not have any email templates yet.',
};

const chooseTextMessageTemplate = {
  pageTitle: generatePageTitle('Choose a text message (SMS) template'),
  pageHeading: 'Choose a text message (SMS) template',
  noTemplatesText: 'You do not have any text message (SMS) templates yet.',
};

const chooseStandardEnglishLetterTemplate = {
  pageTitle: generatePageTitle('Choose a letter template'),
  pageHeading: 'Choose a letter template',
  noTemplatesText: 'You do not have any standard letter templates yet.',
};

const chooseLargePrintLetterTemplate = {
  pageTitle: generatePageTitle('Choose a large print letter template'),
  pageHeading: 'Choose a large print letter template',
  noTemplatesText: 'You do not have any large print letter templates yet.',
};

const previewLargePrintLetterTemplate = {
  pageTitle: generatePageTitle('Preview large print letter template'),
};

const previewOtherLanguageLetterTemplate = {
  pageTitle: generatePageTitle('Preview other language letter template'),
};

const chooseOtherLanguageLetterTemplate = {
  pageTitle: generatePageTitle('Choose other language letter templates'),
  pageHeading: 'Choose other language letter templates',
};

const chooseChannelTemplate = {
  errorHintText: 'You have not chosen a template',
  previousSelectionLabel: 'Previously selected template',
  tableHintText: 'Choose one option',
  tableContent: {
    selectHeading: 'Select',
    nameHeading: 'Name',
    typeHeading: 'Type',
    lastEditedHeading: 'Last edited',
    action: {
      heading: '',
      preview: {
        href: '/message-plans/choose-{{templateType}}-template/{{routingConfigId}}/preview-template/{{templateId}}?lockNumber={{lockNumber}}',
        text: 'Preview',
      },
    },
  },
  actions: {
    save: {
      text: 'Save and continue',
    },
    goToTemplates: {
      text: 'Go to templates',
      href: '/message-templates',
    },
    backLink: {
      text: 'Go back',
      href: '/message-plans/choose-templates/{{routingConfigId}}',
    },
  },
};

const chooseLanguageLetterTemplates = {
  error: {
    missing: {
      hintText: 'You have not chosen any templates',
      linkText: 'Choose one or more templates',
    },
    duplicate: {
      hintText: 'You can only choose one template for each language',
      linkText: 'Choose only one template for each language',
    },
  },
  previousSelectionLabel: 'Previously selected templates',
  noTemplatesText: 'You do not have any other language letter templates yet.',
  tableHintText:
    'Choose all the templates that you want to include in this message plan. You can only choose one template for each language.',
  tableContent: chooseChannelTemplate.tableContent,
  actions: chooseChannelTemplate.actions,
};

const messagePlanDraftAndProdInfo: {
  title: string;
  content: ContentBlock[];
}[] = [
  {
    title: 'Draft',
    content: [
      {
        type: 'text',
        text: "Message plans that you're working on and are not ready to be sent. You can test these, using our:",
      },
      {
        type: 'text',
        text: markdownList('ul', [
          '[API integration environment (opens in a new tab)](https://digital.nhs.uk/developer/api-catalogue/nhs-notify#overview--environments-and-testing)',
          '[Integration MESH mailbox (opens in a new tab)](https://digital.nhs.uk/developer/api-catalogue/nhs-notify-mesh/sending-a-message#sending-your-request)',
        ]),
      },
    ],
  },
  {
    title: 'Production',
    content: [
      {
        type: 'text',
        text: 'Message plans that are ready to be sent using [NHS Notify API (opens in a new tab)](https://digital.nhs.uk/developer/api-catalogue/nhs-notify) or [NHS Notify MESH (opens in a new tab)](https://digital.nhs.uk/developer/api-catalogue/nhs-notify-mesh/).',
      },
    ],
  },
];

const messagePlansPage = {
  pageTitle: generatePageTitle('Message plans'),
  pageHeading: 'Message plans',
  draftAndProdHeading: 'What draft and production mean',
  draftAndProductionInfo: messagePlanDraftAndProdInfo,
  button: {
    text: 'New message plan',
    link: '/message-plans/choose-message-order',
  },
};

const messagePlanGetReadyToMoveToProduction = () => {
  const content: ContentBlock[] = [
    {
      type: 'text',
      text: 'Moving message plans from draft to production means they are ready to send.',
    },
    {
      type: 'text',
      text: 'Any templates used in these message plans will be locked.',
    },
    {
      type: 'text',
      text: 'Messages will only be sent to recipients when you make a request with [NHS Notify API (opens in a new tab)](https://digital.nhs.uk/developer/api-catalogue/nhs-notify) or [NHS Notify MESH (opens in a new tab)](https://digital.nhs.uk/developer/api-catalogue/nhs-notify-mesh).',
    },
    {
      type: 'text',
      text: '## Before you continue',
      overrides: { h2: { props: { className: 'nhsuk-heading-m' } } },
    },
    {
      type: 'text',
      text: 'Make sure:',
    },
    {
      type: 'text',
      text: markdownList('ul', [
        'the relevant stakeholders in your team have approved your templates and message plan',
        'your templates have no errors',
      ]),
      overrides: {
        ul: { props: { className: 'nhsuk-list nhsuk-list--bullet' } },
      },
    },
  ];

  const calloutContent: ContentBlock[] = [
    {
      type: 'text',
      text: 'You cannot edit anything that is in production.',
    },
    {
      type: 'text',
      text: 'If you need to edit your templates or message plans, you can copy and replace them.',
    },
  ];

  return {
    title: generatePageTitle('Get ready to move message plan to production'),
    stepCounter: 'Step 1 of 2',
    heading: 'Get ready to move message plan to production',
    content,
    callout: {
      label: 'Important',
      content: calloutContent,
    },
    continue: {
      text: 'Continue',
      href: (id: string) =>
        `${getBasePath()}/message-plans/review-and-move-to-production/${id}`,
    },
    cancel: {
      text: 'Keep in draft',
      href: `${getBasePath()}/message-plans`,
    },
  };
};

const messagePlansListComponent = {
  tableHeadings: ['Name', 'Routing Plan ID', 'Last edited'],
  noMessagePlansMessage: 'You do not have any message plans in {{status}} yet.',
  copyText: 'Copy names and IDs to clipboard',
  copiedText: 'Names and IDs copied to clipboard',
  copiedFailedText: 'Failed copying names and IDs to clipboard',
  messagePlanLink: {
    DRAFT: '/message-plans/choose-templates/{{routingConfigId}}',
    COMPLETED: '/message-plans/preview-message-plan/{{routingConfigId}}',
  } satisfies Record<RoutingConfigStatusActive, string>,
};

const chooseMessageOrder = {
  pageTitle: generatePageTitle('Choose a message order'),
  pageHeading: 'Choose a message order',
  buttonText: 'Save and continue',
  hint: 'Select one option',
  backLinkText: 'Go back',
  form: {
    messageOrder: { error: 'Select a message order' },
  },
};

const createMessagePlan = {
  pageTitle: generatePageTitle('Create message plan'),
  pageHeading: 'Create a message plan',
  backLink: { href: '/message-plans/choose-message-order', text: 'Go back' },
};

const editMessagePlanSettings = {
  pageTitle: generatePageTitle('Edit message plan settings'),
  pageHeading: 'Edit message plan settings',
  backLink: (id: string) => ({
    href: `/message-plans/choose-templates/${id}`,
    text: 'Go back',
  }),
};

const messagePlanForm = {
  fields: {
    name: {
      label: 'Message plan name',
      hint: 'This will not be visible to recipients.',
      details: {
        summary: 'Naming your message plans',
        text: [
          {
            type: 'text',
            text: 'You should name your message plans in a way that works best for your service or organisation.',
          },
          {
            type: 'text',
            text: 'Common message plan names include the:',
          },
          {
            type: 'text',
            text: markdownList('ul', [
              'channels it uses',
              'subject or reason for the message',
              'intended audience for the message',
              'version number',
            ]),
            overrides: {
              ul: { props: { className: 'nhsuk-list nhsuk-list--bullet' } },
            },
          },
          {
            type: 'text',
            text: "For example, 'Email, SMS, letter - covid19 2023 - over 65s - version 3'",
          },
        ] satisfies ContentBlock[],
      },
    },
    campaignId: {
      label: 'Campaign',
      hintSingle: 'This message plan will link to your only campaign:',
      hintMulti: 'Choose which campaign this message plan will link to',
    },
  },
  submitButton: 'Save and continue',
};

const previewTemplateFromMessagePlan = {
  backLink: {
    href: '/message-plans/choose-{{templateType}}-template/{{routingConfigId}}?lockNumber={{lockNumber}}',
    text: 'Go back',
  },
};

const lockedTemplateWarning = {
  main: "You cannot edit or delete this template because it's used in a message plan that's in production.",
  mainLetter:
    "You cannot delete this template because it's used in a message plan that's in production.",
  copy: {
    link: {
      href: '/copy-template/{{id}}',
      text: 'Copy this template',
      after: ' to create a draft with the same content.',
    },
  },
};

const previewMessagePlan = {
  pageTitle: generatePageTitle('Preview message plan'),
  backLink: {
    href: '/message-plans',
    text: 'Back to all message plans',
  },
  headerCaption: 'Message plan',
  warningCallout: [
    {
      type: 'text',
      text: "You cannot edit this message plan because it's in production.",
    },
  ] satisfies ContentBlock[],
  summaryTable: {
    rowHeadings: {
      id: 'Routing Plan ID',
      campaignId: 'Campaign',
      status: 'Status',
    },
  },
  detailsOpenButton: {
    openText: 'Close all template previews',
    closedText: 'Open all template previews',
  },
  languageFormatsCardHeading: 'Other language letters (optional)',
};

const uploadDocxLetterTemplateForm = {
  fields: {
    name: {
      label: 'Template name',
      hint: 'This will not be visible to recipients',
    },
    campaignId: {
      label: 'Campaign',
      single: {
        hint: 'This message plan will link to your only campaign:',
      },
      select: {
        hint: 'Choose which campaign this letter is for',
      },
    },
    language: {
      label: 'Template language',
      hint: 'Choose the language used in this template',
      placeholder: 'Please select',
      rtl: [
        { type: 'text', text: '**Right-to-left language selected**' },
        {
          type: 'text',
          text: "You've selected a language that reads right-to-left. Make sure you use the [other language (right-aligned) letter template file (opens in a new tab)](https://notify.nhs.uk/using-nhs-notify/upload-a-letter).",
        },
      ] satisfies ContentBlock[],
    },
    file: {
      label: 'Template file',
      hint: [
        {
          type: 'inline-text',
          text: 'Only upload your final letter template file.  \nMake sure you use one of our blank template files to create the letter.',
        },
      ] satisfies ContentBlock[],
    },
  },
  errors: {
    name: {
      empty: 'Enter a template name',
    },
    campaignId: {
      empty: 'Choose a campaign',
    },
    file: {
      empty: 'Choose a template file',
    },
    language: {
      empty: 'Choose a language',
    },
  },
};

type DocxTemplateType = LetterType | 'language';

const docxLetterDisplayMappings: Record<DocxTemplateType, string> = {
  x0: 'standard English',
  x1: 'large print',
  q4: 'British Sign Language',
  language: 'other language',
};

const article = (noun: string) => (/^[aeiou]/i.test(noun) ? 'an' : 'a');

const uploadDocxLetterTemplatePage = (type: DocxTemplateType) => {
  const display = docxLetterDisplayMappings[type];

  return {
    pageTitle: generatePageTitle(
      `Upload ${article(display)} ${display} letter template`
    ),
    backLink: {
      href: '/choose-a-template-type',
      text: 'Back to choose a template type',
    },
    heading: `Upload ${article(display)} ${display} letter template`,
    sideBar: [
      {
        type: 'text',
        text: `## How to create ${article(display)} ${display} letter template`,
        overrides: { h2: { props: { className: 'nhsuk-heading-m' } } },
      },
      {
        type: 'text',
        text: markdownList('ol', [
          'Download the relevant [blank letter template file (opens in a new tab)](https://notify.nhs.uk/using-nhs-notify/upload-a-letter).',
          'Add [formatting (opens in a new tab)](https://notify.nhs.uk/using-nhs-notify/formatting).',
          'Add any [personalisation (opens in a new tab)](https://notify.nhs.uk/using-nhs-notify/personalisation).',
          'Save your Microsoft Word file and upload it to this page.',
        ]),
        overrides: {
          ol: { props: { className: 'nhsuk-list nhsuk-list--number' } },
          li: { props: { className: 'nhsuk-u-margin-bottom-4' } },
        },
      },
    ] satisfies ContentBlock[] as ContentBlock[],
    submitButton: {
      text: 'Upload letter template file',
    },
  };
};

const editTemplateNamePage = {
  pageTitle: generatePageTitle('Edit template name'),
  form: {
    name: {
      label: 'Edit template name',
      hint: 'This will not be visible to recipients',
      errors: {
        empty: 'Enter a template name',
      },
    },
    submit: {
      text: 'Save changes',
    },
  },
  backLink: {
    text: 'Go back',
    href: (templateId: string) => `/preview-letter-template/${templateId}`,
  },
};

const editTemplateCampaignPage = {
  pageTitle: generatePageTitle('Edit template campaign'),
  form: {
    campaignId: {
      label: 'Edit template campaign',
      hint: 'Choose which campaign this letter is for',
      errors: {
        empty: 'Choose a campaign',
      },
    },
    submit: {
      text: 'Save changes',
    },
  },
  backLink: {
    text: 'Go back',
    href: (templateId: string) => `/preview-letter-template/${templateId}`,
  },
};

const content = {
  global: { mainLayout },
  components: {
    channelGuidance,
    chooseChannelTemplate,
    chooseLanguageLetterTemplates,
    chooseMessageOrder,
    chooseTemplateType,
    copyTemplate,
    deleteTemplate,
    errorSummary,
    footer,
    header,
    letterRender,
    lockedTemplateWarning,
    logoutWarning,
    messageFormatting,
    messagePlanBlock,
    messagePlanChannelTemplate,
    messagePlanFallbackConditions,
    messagePlanForm,
    messagePlansListComponent,
    personalisation,
    previewDigitalTemplate,
    previewEmailTemplate,
    previewLetterTemplate,
    previewNHSAppTemplate,
    previewSMSTemplate,
    previewTemplateDetails,
    previewTemplateFromMessagePlan,
    requestProof,
    submitLetterTemplate,
    submitTemplate,
    templateFormEmail,
    templateFormLetter,
    templateFormNhsApp,
    templateFormSms,
    templateNameGuidance,
    templateSubmitted,
    uploadDocxLetterTemplateForm,
    viewSubmittedTemplate,
  },
  pages: {
    chooseEmailTemplate,
    chooseLargePrintLetterTemplate,
    chooseNhsAppTemplate,
    chooseOtherLanguageLetterTemplate,
    chooseStandardEnglishLetterTemplate,
    chooseTemplatesForMessagePlan,
    chooseTextMessageTemplate,
    createMessagePlan,
    deleteTemplateErrorPage,
    editMessagePlanSettings,
    editTemplateCampaignPage,
    editTemplateNamePage,
    error404,
    homePage,
    letterTemplateInvalidConfiguration,
    messagePlanGetReadyToMoveToProduction,
    messagePlanInvalidConfiguration,
    messagePlansPage,
    messageTemplates,
    previewLargePrintLetterTemplate,
    previewOtherLanguageLetterTemplate,
    previewMessagePlan,
    submitLetterTemplate: submitLetterTemplatePage,
    uploadDocxLetterTemplatePage,
  },
};

export default content;
