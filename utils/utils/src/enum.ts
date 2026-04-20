import type {
  TemplateType,
  TemplateStatus,
  LetterType,
  Language,
  TemplateDto,
  Channel,
  RoutingConfigStatus,
  ClientFeatures,
  LetterVersion,
} from 'nhs-notify-web-template-management-types';
import { DigitalTemplate, DigitalTemplateType, LetterTemplate } from './types';

/**
 * @typedef {Object} LanguageMetadata
 * @property {string} [name] - The display name of the language in English
 * @property {boolean} [rtl] - Right-to-left indicator
 * Strictly speaking a language is not directional, the script that a language
 * is written in is directional, so here we are assuming that a language will
 * be written in the most common script, in order to determine the writing direction.
 *
 * https://www.w3.org/International/questions/qa-scripts
 */
type LanguageMetadata = {
  name: string;
  rtl: boolean;
};

type PartialTemplate = {
  templateType: TemplateType;
  templateStatus: TemplateStatus;
  letterVersion?: LetterVersion;
};

const languageMap: Record<Language, LanguageMetadata> = {
  ar: { name: 'Arabic', rtl: true },
  bg: { name: 'Bulgarian', rtl: false },
  bn: { name: 'Bengali', rtl: false },
  de: { name: 'German', rtl: false },
  el: { name: 'Greek', rtl: false },
  en: { name: 'English', rtl: false },
  es: { name: 'Spanish', rtl: false },
  fa: { name: 'Persian', rtl: true },
  fr: { name: 'French', rtl: false },
  gu: { name: 'Gujurati', rtl: false },
  hi: { name: 'Hindi', rtl: false },
  hu: { name: 'Hungarian', rtl: false },
  it: { name: 'Italian', rtl: false },
  ku: { name: 'Kurdish', rtl: true },
  lt: { name: 'Lithuanian', rtl: false },
  lv: { name: 'Latvian', rtl: false },
  ne: { name: 'Nepali', rtl: false },
  pa: { name: 'Punjabi', rtl: false },
  pl: { name: 'Polish', rtl: false },
  pt: { name: 'Portuguese', rtl: false },
  ro: { name: 'Romanian', rtl: false },
  ru: { name: 'Russian', rtl: false },
  sk: { name: 'Slovak', rtl: false },
  so: { name: 'Somali', rtl: false },
  sq: { name: 'Albanian', rtl: false },
  ta: { name: 'Tamil', rtl: false },
  tr: { name: 'Turkish', rtl: false },
  ur: { name: 'Urdu', rtl: true },
  zh: { name: 'Chinese', rtl: false },
};

export const isLanguage = (value: unknown): value is Language => {
  return typeof value === 'string' && Object.keys(languageMap).includes(value);
};

export const languageMapping = (language: Language) =>
  languageMap[language].name;

export const alphabeticalLanguageList: Array<[Language, LanguageMetadata]> = (
  Object.entries(languageMap) as Array<[Language, LanguageMetadata]>
).sort(([, languageMetadataA], [, languageMetadataB]) =>
  languageMetadataA.name.localeCompare(languageMetadataB.name)
);

// Letter types that can be selected in the UI (includes frontend concept 'language')
export const FRONTEND_SUPPORTED_LETTER_TYPES = [
  'x0',
  'x1',
  'q4',
  'language',
] as const satisfies readonly (LetterType | 'language')[];
export type FrontendSupportedLetterType =
  (typeof FRONTEND_SUPPORTED_LETTER_TYPES)[number];

export function isFrontendSupportedLetterType(
  value: string
): value is FrontendSupportedLetterType {
  const types: readonly string[] = FRONTEND_SUPPORTED_LETTER_TYPES;
  return types.includes(value);
}

export const FRONTEND_SUPPORTED_ACCESSIBLE_FORMATS = [
  'x1',
  'q4',
] as const satisfies readonly Exclude<
  FrontendSupportedLetterType,
  'language' | 'x0'
>[];
export type FrontendSupportedAccessibleFormats =
  (typeof FRONTEND_SUPPORTED_ACCESSIBLE_FORMATS)[number];

const letterTypeMap: Record<
  Exclude<FrontendSupportedLetterType, 'language'>,
  string
> = {
  q4: 'British Sign Language',
  x0: 'Standard',
  x1: 'Large print',
};

export const letterTypeMapping = (
  letterType: Exclude<FrontendSupportedLetterType, 'language'>
) => `${letterTypeMap[letterType]} letter`;

export const alphabeticalLetterTypeList = Object.entries(letterTypeMap).sort(
  ([, nameA], [, nameB]) => nameA.localeCompare(nameB)
);

export const letterTypeDisplayMappings = (
  letterType: Exclude<FrontendSupportedLetterType, 'language'>,
  language: Language
) =>
  language === 'en'
    ? letterTypeMapping(letterType)
    : `${letterTypeMapping(letterType)} - ${languageMapping(language)}`;

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    NHS_APP: 'NHS App message',
    SMS: 'Text message (SMS)',
    EMAIL: 'Email',
    LETTER: 'Letter',
  })[type];

export const statusToDisplayMapping = (
  template: PartialTemplate,
  featureFlags: Pick<ClientFeatures, 'routing'>
): string => {
  const notYetSubmittedLetter =
    template.letterVersion === 'AUTHORING'
      ? 'Approval needed'
      : 'Not yet submitted';

  const notYetSubmitted =
    template.templateType === 'LETTER' ? notYetSubmittedLetter : 'Draft';

  let submitted = featureFlags.routing ? 'Locked' : 'Submitted';

  if (
    template.templateType === 'LETTER' &&
    template.letterVersion !== 'AUTHORING'
  ) {
    submitted = 'Submitted';
  }

  const statusToDisplayMappings: Record<TemplateStatus, string> = {
    NOT_YET_SUBMITTED: notYetSubmitted,
    SUBMITTED: submitted,
    DELETED: '', // will not be shown in the UI
    PENDING_PROOF_REQUEST: 'Files uploaded',
    PENDING_UPLOAD: 'Checking files',
    PENDING_VALIDATION: 'Checking files',
    VALIDATION_FAILED: 'Checks failed',
    VIRUS_SCAN_FAILED: 'Checks failed',
    WAITING_FOR_PROOF: 'Waiting for proof',
    PROOF_AVAILABLE: 'Proof available',
    PROOF_APPROVED:
      template.letterVersion === 'AUTHORING' ? 'Approved' : 'Proof approved',
  };

  return statusToDisplayMappings[template.templateStatus];
};

type Colour =
  | 'white'
  | 'grey'
  | 'green'
  | 'aqua-green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | undefined;

export const statusToColourMapping = (
  template: PartialTemplate,
  featureFlags: Pick<ClientFeatures, 'routing'>
) => {
  const notYetSubmittedLetter =
    template.letterVersion === 'AUTHORING' ? 'yellow' : undefined;

  const notYetSubmitted =
    template.templateType === 'LETTER' ? notYetSubmittedLetter : 'green';

  let submitted: Colour = featureFlags.routing ? 'pink' : 'grey';

  if (
    template.templateType === 'LETTER' &&
    template.letterVersion !== 'AUTHORING'
  ) {
    submitted = 'grey';
  }

  const colourMappings: Record<TemplateStatus, Colour> = {
    NOT_YET_SUBMITTED: notYetSubmitted,
    SUBMITTED: submitted,
    DELETED: undefined,
    PENDING_PROOF_REQUEST: 'blue',
    PENDING_UPLOAD: 'blue',
    PENDING_VALIDATION: 'blue',
    VIRUS_SCAN_FAILED: 'red',
    VALIDATION_FAILED: 'red',
    WAITING_FOR_PROOF: 'yellow',
    PROOF_AVAILABLE: 'orange',
    PROOF_APPROVED: 'green',
  };

  return colourMappings[template.templateStatus];
};

export const legacyTemplateTypeToUrlTextMappings = (type: TemplateType) =>
  ({
    NHS_APP: 'nhs-app',
    SMS: 'text-message',
    EMAIL: 'email',
    LETTER: 'letter',
  })[type];

export const testMessageUrlSegmentMapping = (type: DigitalTemplateType) =>
  ({
    NHS_APP: 'nhs-app-message',
    SMS: 'text-message',
    EMAIL: 'email',
  })[type];

export const sendDigitalTemplateTestMessageUrl = (
  type: DigitalTemplateType,
  templateId: string
) => `/send-test-${testMessageUrlSegmentMapping(type)}/${templateId}`;

type UrlFormattableLetterTemplate = Pick<LetterTemplate, 'templateType'> &
  Partial<Pick<LetterTemplate, 'language' | 'letterType'>>;

export type UrlFormattableTemplate =
  | Pick<DigitalTemplate, 'templateType'>
  | UrlFormattableLetterTemplate;

const getFrontendLetterTypeForUrl = (
  template: UrlFormattableLetterTemplate
): FrontendSupportedLetterType => {
  if (template.letterType && template.letterType !== 'x0') {
    return template.letterType;
  }

  if (template.language && template.language !== 'en') {
    return 'language';
  }

  return 'x0';
};

export const templateToUrlTextMappings = (template: UrlFormattableTemplate) => {
  if (template.templateType === 'LETTER') {
    const letterType = getFrontendLetterTypeForUrl(template);

    return {
      q4: 'british-sign-language-letter',
      x0: 'standard-english-letter',
      x1: 'large-print-letter',
      language: 'other-language-letter',
    }[letterType];
  }

  return {
    NHS_APP: 'nhs-app',
    SMS: 'text-message',
    EMAIL: 'email',
  }[template.templateType];
};

const creationAction = (type: TemplateType) =>
  ({
    NHS_APP: 'create',
    SMS: 'create',
    EMAIL: 'create',
    LETTER: 'upload',
  })[type];

export const legacyTemplateCreationPages = (type: TemplateType) =>
  `/${creationAction(type)}-${legacyTemplateTypeToUrlTextMappings(type)}-template`;

const frontendLetterTypeToBackendLetterType = (
  letterType?: FrontendSupportedLetterType
): LetterType => {
  if (!letterType || letterType === 'language') return 'x0';
  return letterType;
};

const frontendLetterTypeToDefaultLanguage = (
  letterType?: FrontendSupportedLetterType
): Language => {
  if (!letterType || letterType !== 'language') return 'en';
  // If a language letter, return any non-"en" value
  // This gets mapped to "other-language" in urls
  return 'fr';
};

export const toUrlFormattableTemplate = (
  templateType: TemplateType,
  letterType?: FrontendSupportedLetterType
): UrlFormattableTemplate =>
  templateType === 'LETTER'
    ? {
        templateType,
        letterType: frontendLetterTypeToBackendLetterType(letterType),
        language: frontendLetterTypeToDefaultLanguage(letterType),
      }
    : { templateType };

export const createTemplateUrl = (template: UrlFormattableTemplate) => {
  return `/${creationAction(template.templateType)}-${templateToUrlTextMappings(template)}-template`;
};

export const getPreviewURL = (template: TemplateDto) => {
  if (
    template.templateType === 'LETTER' &&
    template.letterVersion === 'AUTHORING' &&
    ['PROOF_APPROVED', 'SUBMITTED'].includes(template.templateStatus)
  ) {
    return `/preview-approved-letter-template/${template.id}`;
  }

  if (template.templateStatus === 'SUBMITTED') {
    return `/preview-submitted-${legacyTemplateTypeToUrlTextMappings(template.templateType)}-template/${template.id}`;
  }

  return `/preview-${legacyTemplateTypeToUrlTextMappings(template.templateType)}-template/${template.id}`;
};

export const messagePlanChooseTemplateUrl = (
  template: UrlFormattableTemplate
) => {
  return `choose-${templateToUrlTextMappings(template)}-template`;
};

const templateStatusCopyAction = (status: TemplateStatus) =>
  (
    ({
      NOT_YET_SUBMITTED: true,
      SUBMITTED: true,
      DELETED: false,
      PENDING_PROOF_REQUEST: true,
      PENDING_UPLOAD: true,
      PENDING_VALIDATION: true,
      VIRUS_SCAN_FAILED: true,
      VALIDATION_FAILED: true,
      WAITING_FOR_PROOF: false,
      PROOF_AVAILABLE: false,
      PROOF_APPROVED: true,
    }) satisfies Record<TemplateStatus, boolean>
  )[status];

const templateTypeCopyAction = (type: TemplateType) =>
  (
    ({
      NHS_APP: true,
      SMS: true,
      EMAIL: true,
      LETTER: false,
    }) satisfies Record<TemplateType, boolean>
  )[type];

const templateStatusDeleteAction = (status: TemplateStatus) =>
  (
    ({
      NOT_YET_SUBMITTED: true,
      SUBMITTED: false,
      DELETED: false,
      PENDING_PROOF_REQUEST: true,
      PENDING_UPLOAD: true,
      PENDING_VALIDATION: true,
      VIRUS_SCAN_FAILED: true,
      VALIDATION_FAILED: true,
      WAITING_FOR_PROOF: false,
      PROOF_AVAILABLE: true,
      PROOF_APPROVED: true,
    }) satisfies Record<TemplateStatus, boolean>
  )[status];

const templateTypeDeleteAction = (type: TemplateType) =>
  (
    ({
      NHS_APP: true,
      SMS: true,
      EMAIL: true,
      LETTER: true,
    }) satisfies Record<TemplateType, boolean>
  )[type];

export const templateDisplayCopyAction = ({
  templateType,
  templateStatus,
}: Pick<TemplateDto, 'templateType' | 'templateStatus'>) =>
  templateTypeCopyAction(templateType) &&
  templateStatusCopyAction(templateStatus);

export const templateDisplayDeleteAction = ({
  templateType,
  templateStatus,
}: Pick<TemplateDto, 'templateType' | 'templateStatus'>) =>
  templateTypeDeleteAction(templateType) &&
  templateStatusDeleteAction(templateStatus);

export function isRightToLeft(language: Language): boolean {
  return languageMap[language].rtl;
}

export const MESSAGE_ORDER_OPTIONS_LIST = [
  'NHSAPP',
  'NHSAPP,EMAIL',
  'NHSAPP,SMS',
  'NHSAPP,EMAIL,SMS',
  'NHSAPP,SMS,EMAIL',
  'NHSAPP,SMS,LETTER',
  'NHSAPP,EMAIL,SMS,LETTER',
  'EMAIL',
  'LETTER',
] as const;

export type MessageOrder = (typeof MESSAGE_ORDER_OPTIONS_LIST)[number];

export const getMessageOrderOptions = (
  features: ClientFeatures
): MessageOrder[] => {
  if (!features.letterAuthoring) {
    return MESSAGE_ORDER_OPTIONS_LIST.filter(
      (messageOrder): messageOrder is MessageOrder =>
        !messageOrder.includes('LETTER')
    );
  }

  return [...MESSAGE_ORDER_OPTIONS_LIST];
};

export const ORDINALS = [
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
  'Sixth',
];

export const channelToTemplateType = (channel: Channel): TemplateType => {
  const map: Record<Channel, TemplateType> = {
    EMAIL: 'EMAIL',
    LETTER: 'LETTER',
    NHSAPP: 'NHS_APP',
    SMS: 'SMS',
  };
  return map[channel];
};

export const templateTypeToChannel = (templateType: TemplateType): Channel => {
  const map: Record<TemplateType, Channel> = {
    EMAIL: 'EMAIL',
    LETTER: 'LETTER',
    NHS_APP: 'NHSAPP',
    SMS: 'SMS',
  };
  return map[templateType];
};

export const channelDisplayMappings = (channel: Channel) => {
  const map: Record<Channel, string> = {
    NHSAPP: 'NHS App',
    SMS: 'Text message (SMS)',
    EMAIL: 'Email',
    LETTER: 'Standard English letter',
  };
  return map[channel];
};

export const accessibleFormatDisplayMappings = (
  letterType: Exclude<FrontendSupportedAccessibleFormats, 'language'>
) => {
  const map: Record<FrontendSupportedAccessibleFormats, string> = {
    q4: 'British Sign Language letter',
    x1: 'Large print letter',
  };

  return map[letterType];
};

const messagePlanStatusToDisplayMappings: Record<RoutingConfigStatus, string> =
  {
    DRAFT: 'Draft',
    COMPLETED: 'Production',
    DELETED: '',
  } as const;

const messagePlanStatusColourMappings: Record<RoutingConfigStatus, Colour> = {
  DRAFT: 'green',
  COMPLETED: 'red',
  DELETED: undefined,
} as const;

export const messagePlanStatusToDisplayText = (
  status: RoutingConfigStatus
): string => messagePlanStatusToDisplayMappings[status];

export const messagePlanStatusToTagColour = (
  status: RoutingConfigStatus
): Colour => messagePlanStatusColourMappings[status];
