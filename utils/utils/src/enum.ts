import {
  TemplateType,
  TemplateStatus,
  LetterType,
  Language,
  TemplateDto,
} from 'nhs-notify-backend-client';

const languageMap: Record<Language, string> = {
  ar: 'Arabic',
  bg: 'Bulgarian',
  bn: 'Bengali',
  de: 'German',
  el: 'Greek',
  en: 'English',
  es: 'Spanish',
  fa: 'Persian',
  fr: 'French',
  gu: 'Gujurati',
  hi: 'Hindi',
  hu: 'Hungarian',
  it: 'Italian',
  ku: 'Kurdish',
  lt: 'Lithuanian',
  lv: 'Latvian',
  ne: 'Nepali',
  pa: 'Punjabi',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  so: 'Somali',
  sq: 'Albanian',
  ta: 'Tamil',
  tr: 'Turkish',
  ur: 'Urdu',
  zh: 'Chinese',
};
export const languageMapping = (language: Language) => languageMap[language];
export const alphabeticalLanguageList = Object.entries(languageMap).sort(
  ([, nameA], [, nameB]) => nameA.localeCompare(nameB)
);

const letterTypeMap: Record<LetterType, string> = {
  x3: 'Audio CD',
  q1: 'Braille',
  q4: 'British Sign Language',
  x0: 'Standard',
  x1: 'Large print',
};

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

export const templateStatusToDisplayMappings = (status: TemplateStatus) =>
  ({
    NOT_YET_SUBMITTED: 'Not yet submitted',
    SUBMITTED: 'Submitted',
    DELETED: '', // will not be shown in the UI
    PENDING_PROOF_REQUEST: 'Files uploaded',
    PENDING_UPLOAD: 'Checking files',
    PENDING_VALIDATION: 'Checking files',
    VALIDATION_FAILED: 'Checks failed',
    VIRUS_SCAN_FAILED: 'Checks failed',
    WAITING_FOR_PROOF: 'Waiting for proof',
    PROOF_AVAILABLE: 'Proof available',
  })[status];

export const templateStatusToColourMappings = (status: TemplateStatus) =>
  (
    ({
      NOT_YET_SUBMITTED: undefined,
      SUBMITTED: 'grey',
      DELETED: undefined,
      PENDING_PROOF_REQUEST: 'blue',
      PENDING_UPLOAD: 'blue',
      PENDING_VALIDATION: 'blue',
      VIRUS_SCAN_FAILED: 'red',
      VALIDATION_FAILED: 'red',
      WAITING_FOR_PROOF: 'yellow',
      PROOF_AVAILABLE: 'yellow',
    }) as const
  )[status];

export const templateTypeToUrlTextMappings = (type: TemplateType) =>
  ({
    NHS_APP: 'nhs-app',
    SMS: 'text-message',
    EMAIL: 'email',
    LETTER: 'letter',
  })[type];

export const previewTemplatePages = (type: TemplateType) =>
  `preview-${templateTypeToUrlTextMappings(type)}-template`;
export const previewSubmittedTemplatePages = (type: TemplateType) =>
  `preview-submitted-${templateTypeToUrlTextMappings(type)}-template`;

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
