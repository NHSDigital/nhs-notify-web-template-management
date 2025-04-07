/**
 * Lists of generated string literal unions, for iteration and zod validation via z.enum.
 * Ideally the generator would create the unions off an as const array and
 * this wouldn't be needed, but that's not currently available.
 * Note that there is a unit test against these to guard against duplicates
 */
import {
  Language,
  LetterType,
  TemplateStatus,
  TemplateType,
  VirusScanStatus,
} from '../types/generated';
import { arrayOfAll } from 'nhs-notify-web-template-management-utils';

export const TEMPLATE_TYPE_LIST = arrayOfAll<TemplateType>()([
  'NHS_APP',
  'EMAIL',
  'SMS',
  'LETTER',
]);

export const TEMPLATE_STATUS_LIST = arrayOfAll<TemplateStatus>()([
  'NOT_YET_SUBMITTED',
  'SUBMITTED',
  'DELETED',
  'PENDING_UPLOAD',
  'PENDING_VALIDATION',
  'VIRUS_SCAN_FAILED',
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
