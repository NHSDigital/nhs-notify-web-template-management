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
    [Language.AR]: 'Arabic',
    [Language.BG]: 'Bulgarian',
    [Language.BN]: 'Bengali',
    [Language.DE]: 'German',
    [Language.EL]: 'Greek',
    [Language.EN]: 'English',
    [Language.ES]: 'Spanish',
    [Language.FA]: 'Persian',
    [Language.FR]: 'French',
    [Language.GU]: 'Gujurati',
    [Language.HI]: 'Hindi',
    [Language.HU]: 'Hungarian',
    [Language.IT]: 'Italian',
    [Language.KU]: 'Kurdish',
    [Language.LT]: 'Lithuanian',
    [Language.LV]: 'Latvian',
    [Language.NE]: 'Nepali',
    [Language.PA]: 'Punjabi',
    [Language.PL]: 'Polish',
    [Language.PT]: 'Portuguese',
    [Language.RO]: 'Romanian',
    [Language.RU]: 'Russian',
    [Language.SK]: 'Slovak',
    [Language.SO]: 'Somali',
    [Language.SQ]: 'Albanian',
    [Language.TA]: 'Tamil',
    [Language.TR]: 'Turkish',
    [Language.UR]: 'Urdu',
    [Language.ZH]: 'Chinese',
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
  language === Language.EN
    ? `${letterTypeMapping(letterType)} letter`
    : `Letter - ${languageMapping(language)}`;

export const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App message',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
    [TemplateType.LETTER]: 'Letter',
  })[type];

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
