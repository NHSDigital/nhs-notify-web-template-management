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
} from 'nhs-notify-backend-client';

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

const letterTypeMap: Record<LetterType, string> = {
  q4: 'British Sign Language',
  x0: 'Standard',
  x1: 'Large print',
};

// Letter types that can be selected in the UI (includes frontend concept 'language')
export type SupportedLetterType = LetterType | 'language';
export const SUPPORTED_LETTER_TYPES = [
  'x0',
  'x1',
  'q4',
  'language',
] as const satisfies readonly SupportedLetterType[];

// Accessible format letter types (excludes standard x0)
export type AccessibleFormatLetterType = Exclude<LetterType, 'x0'>;

// Letter types supported in routing (excludes BSL)
export type RoutingSupportedLetterType = Exclude<SupportedLetterType, 'q4'>;

// Accessible format letter types supported in routing (excludes BSL)
export type RoutingAccessibleFormatLetterType = Exclude<
  AccessibleFormatLetterType,
  'q4'
>;
export const ROUTING_ACCESSIBLE_FORMAT_LETTER_TYPES = [
  'x1',
] as const satisfies readonly RoutingAccessibleFormatLetterType[];

// Conditional template types in routing (accessible formats + foreign language)
export type RoutingConditionalLetterType =
  | RoutingAccessibleFormatLetterType
  | 'language';

export const letterTypeMapping = (letterType: LetterType) =>
  `${letterTypeMap[letterType]} letter`;

export const alphabeticalLetterTypeList = Object.entries(letterTypeMap).sort(
  ([, nameA], [, nameB]) => nameA.localeCompare(nameB)
);

export const letterTypeDisplayMappings = (
  letterType: LetterType,
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

  const submitted = featureFlags.routing ? 'Locked' : 'Submitted';

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
    PROOF_APPROVED: 'Proof approved',
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

  const submitted = featureFlags.routing ? 'pink' : 'grey';

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

export const templateTypeToUrlTextMappings = (
  type: TemplateType,
  letterType?: SupportedLetterType
) =>
  ({
    NHS_APP: 'nhs-app',
    SMS: 'text-message',
    EMAIL: 'email',
    LETTER: {
      q4: 'british-sign-language-letter',
      x0: 'standard-english-letter',
      x1: 'large-print-letter',
      language: 'other-language-letter',
    }[letterType || 'x0'],
  })[type];

const creationAction = (type: TemplateType) =>
  ({
    NHS_APP: 'create',
    SMS: 'create',
    EMAIL: 'create',
    LETTER: 'upload',
  })[type];

export const legacyTemplateCreationPages = (type: TemplateType) =>
  `/${creationAction(type)}-${legacyTemplateTypeToUrlTextMappings(type)}-template`;

export const createTemplateUrl = (
  templateType: TemplateType,
  letterType?: SupportedLetterType
) =>
  `/${creationAction(templateType)}-${templateTypeToUrlTextMappings(templateType, letterType)}-template`;

export const previewTemplatePages = (type: TemplateType) =>
  `preview-${legacyTemplateTypeToUrlTextMappings(type)}-template`;
export const previewSubmittedTemplatePages = (type: TemplateType) =>
  `preview-submitted-${legacyTemplateTypeToUrlTextMappings(type)}-template`;

export const messagePlanChooseTemplateUrl = (
  type: TemplateType,
  letterType?: RoutingSupportedLetterType
) => `choose-${templateTypeToUrlTextMappings(type, letterType)}-template`;

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

export const accessibleFormatDisplayMappings = (letterType: LetterType) => {
  const map: Record<LetterType, string> = {
    q4: 'British Sign Language letter',
    x0: 'Standard letter',
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
