import {
  TemplateType,
  TemplateStatus,
  LetterType,
  Language,
  TemplateDto,
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
      PROOF_AVAILABLE: 'orange',
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

export function isRightToLeft(language: Language): boolean {
  return languageMap[language].rtl;
}
