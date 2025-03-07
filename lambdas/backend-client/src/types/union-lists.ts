import {
  Language,
  LetterType,
  TemplateStatus,
  TemplateType,
  VirusScanStatus,
} from './generated';

export const TEMPLATE_TYPE_LIST = Object.keys({
  NHS_APP: null,
  EMAIL: null,
  SMS: null,
  LETTER: null,
} satisfies Record<TemplateType, null>) as TemplateType[];

export const TEMPLATE_STATUS_LIST = Object.keys({
  NOT_YET_SUBMITTED: null,
  SUBMITTED: null,
  DELETED: null,
} satisfies Record<TemplateStatus, null>) as TemplateStatus[];

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
} satisfies Record<Language, null>) as Language[];

export const LETTER_TYPE_LIST = Object.keys({
  x3: null,
  q1: null,
  q4: null,
  x0: null,
  x1: null,
} satisfies Record<LetterType, null>) as LetterType[];

export const VIRUS_SCAN_STATUS_LIST = Object.keys({
  PENDING: null,
  FAILED: null,
  PASSED: null,
} satisfies Record<VirusScanStatus, null>) as VirusScanStatus[];
