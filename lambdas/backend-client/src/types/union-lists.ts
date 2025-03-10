import { Language, TemplateStatus, TemplateType } from './generated';

export const TEMPLATE_TYPE_LIST = Object.keys({
  EMAIL: null,
  NHS_APP: null,
  SMS: null,
  LETTER: null,
} satisfies Record<TemplateType, null>);

export const TEMPLATE_STATUS_LIST = Object.keys({
  NOT_YET_SUBMITTED: null,
  SUBMITTED: null,
  DELETED: null,
} satisfies Record<TemplateStatus, null>);

export const LANGUAGE_LIST = Object.keys({
  ar: null,
  bg: null,
  bn: null,
  de: null,
  el: null,
  en: null,
  es: null,
  fa: null,
  fr: null,
  gu: null,
  hi: null,
  hu: null,
  it: null,
  ku: null,
  lt: null,
  lv: null,
  ne: null,
  pa: null,
  pl: null,
  pt: null,
  ro: null,
  ru: null,
  sk: null,
  so: null,
  sq: null,
  ta: null,
  tr: null,
  ur: null,
  zh: null,
} satisfies Record<Language, null>);
