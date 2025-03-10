import {
  Language,
  LetterType,
  TemplateStatus,
  TemplateType,
  VirusScanStatus,
} from './generated';
import { arrayOfAll } from './util';

export const TEMPLATE_TYPE_LIST = arrayOfAll<TemplateType>()([
  'EMAIL',
  'NHS_APP',
  'SMS',
  'LETTER',
]);

export const TEMPLATE_STATUS_LIST = arrayOfAll<TemplateStatus>()([
  'NOT_YET_SUBMITTED',
  'SUBMITTED',
  'DELETED',
  'PENDING_UPLOAD',
  'PENDING_VALIDATION',
]);

export const LANGUAGE_LIST = arrayOfAll<Language>()([
  'ar',
  'bg',
  'bn',
  'de',
  'el',
  'en',
  'es',
  'fa',
  'fr',
  'gu',
  'hi',
  'hu',
  'it',
  'ku',
  'lt',
  'lv',
  'ne',
  'pa',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'so',
  'sq',
  'ta',
  'tr',
  'ur',
  'zh',
]);

export const LETTER_TYPE_LIST = arrayOfAll<LetterType>()([
  'x3',
  'q1',
  'q4',
  'x0',
  'x1',
]);

export const VIRUS_SCAN_STATUS_LIST = arrayOfAll<VirusScanStatus>()([
  'PENDING',
  'FAILED',
  'PASSED',
]);
