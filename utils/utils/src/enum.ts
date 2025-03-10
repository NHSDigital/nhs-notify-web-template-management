import {
  TemplateType,
  TemplateStatus,
  LetterType,
  Language,
} from 'nhs-notify-backend-client';

// eslint-disable-next-line unicorn/prefer-export-from
export { TemplateType, TemplateStatus };

export const languageMapping = (language: Language) =>
  ({
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
  })[language];
const letterTypeMapping = (letterType: LetterType) =>
  ({
    [LetterType.X3]: 'Audio CD',
    [LetterType.Q1]: 'Braille',
    [LetterType.Q4]: 'British Sign Language',
    [LetterType.X0]: 'Standard',
    [LetterType.X1]: 'Large print',
  })[letterType];

export const letterTypeDisplayMappings = (
  letterType: LetterType,
  language: Language
) =>
  language === 'en'
    ? `${letterTypeMapping(letterType)} letter`
    : `Letter - ${languageMapping(language)}`;

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
export const viewSubmittedTemplatePages = (type: TemplateType) =>
  `view-submitted-${templateTypeToUrlTextMappings(type)}-template`;
