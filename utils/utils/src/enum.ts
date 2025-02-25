import {
  TemplateType,
  TemplateStatus,
  LetterType,
  Language,
} from 'nhs-notify-backend-client';

// eslint-disable-next-line unicorn/prefer-export-from
export { TemplateType, TemplateStatus };

const letterTypeMapping = (letterType: LetterType) =>
  ({
    [LetterType.AUDIO]: 'Audio',
    [LetterType.BRAILLE]: 'Braille',
    [LetterType.BSL]: 'British Sign Language',
    [LetterType.STANDARD]: 'Standard',
    [LetterType.LARGE_PRINT]: 'Large print',
  })[letterType];

export const languageMapping = (language: Language) =>
  language
    .split(' ')
    .map((word) => `${word[0]}${word.slice(1).toLocaleLowerCase()}`)
    .join(' ');

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App message',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
    [TemplateType.LETTER]: 'Letter',
  })[type];

export const letterTypeDisplayMappings = (
  letterType: LetterType,
  language: Language
) =>
  language === Language.ENGLISH
    ? `${letterTypeMapping(letterType)} letter`
    : `Letter - ${languageMapping(language)}`;

export const templateStatusToDisplayMappings = (status: TemplateStatus) =>
  ({
    [TemplateStatus.NOT_YET_SUBMITTED]: 'Not yet submitted',
    [TemplateStatus.SUBMITTED]: 'Submitted',
    [TemplateStatus.DELETED]: '', // will not be shown in the UI
  })[status];

export const templateTypeToUrlTextMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'nhs-app',
    [TemplateType.SMS]: 'text-message',
    [TemplateType.EMAIL]: 'email',
    [TemplateType.LETTER]: 'letter',
  })[type];

export const previewTemplatePages = (type: TemplateType) =>
  `preview-${templateTypeToUrlTextMappings(type)}-template`;
export const viewSubmittedTemplatePages = (type: TemplateType) =>
  `view-submitted-${templateTypeToUrlTextMappings(type)}-template`;
