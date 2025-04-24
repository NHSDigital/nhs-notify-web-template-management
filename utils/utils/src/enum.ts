import {
  TemplateType,
  TemplateStatus,
  LetterType,
  Language,
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
    PENDING_UPLOAD: 'Processing',
    PENDING_VALIDATION: 'Processing',
    VIRUS_SCAN_FAILED: 'Virus Scan Failed',
    VALIDATION_FAILED: 'Validation Failed',
  })[status];

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
