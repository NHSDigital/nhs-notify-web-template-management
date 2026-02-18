/**
 * Lists of generated string literal unions, for iteration and zod validation via z.enum.
 * Ideally the generator would create the unions off an as const array and
 * this wouldn't be needed, but that's not currently available.
 * Note that there is a unit test against these to guard against duplicates
 */
import {
  CascadeGroupName,
  Channel,
  ChannelType,
  Language,
  LetterType,
  LetterValidationError,
  RenderStatus,
  RoutingConfigStatus,
  TemplateStatus,
  TemplateType,
  VirusScanStatus,
} from '../types/generated';

/**
 * Returns an identity function which will fail to compile if 'array'
 * doesn't contain all the cases of 'Union'
 *
 * @example
 * const arrayOfFooBarBaz = arrayOfAll<'foo' | 'bar' | 'baz'>();
 *
 * const a = arrayOfFooBarBaz(['foo', 'bar']); // does not compile
 * const b = arrayOfFooBarBaz(['foo', 'bar', 'baz']); // compiles
 */
export function arrayOfAll<Union>() {
  return <T extends [Union, ...Union[]]>(
    array: T & ([Union] extends [T[number]] ? unknown : 'Invalid')
  ) => array;
}

export const TEMPLATE_TYPE_LIST = arrayOfAll<TemplateType>()([
  'NHS_APP',
  'EMAIL',
  'SMS',
  'LETTER',
]);

export const TEMPLATE_STATUS_LIST = arrayOfAll<TemplateStatus>()([
  'DELETED',
  'NOT_YET_SUBMITTED',
  'PENDING_PROOF_REQUEST',
  'PENDING_UPLOAD',
  'PENDING_VALIDATION',
  'PROOF_APPROVED',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'VALIDATION_FAILED',
  'VIRUS_SCAN_FAILED',
  'WAITING_FOR_PROOF',
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

export const LETTER_TYPE_LIST = arrayOfAll<LetterType>()(['q4', 'x0', 'x1']);

export const LETTER_VALIDATION_ERROR_LIST = arrayOfAll<LetterValidationError>()(
  ['MISSING_ADDRESS_LINES', 'VIRUS_SCAN_FAILED']
);

export const VIRUS_SCAN_STATUS_LIST = arrayOfAll<VirusScanStatus>()([
  'PENDING',
  'FAILED',
  'PASSED',
]);

export const RENDER_STATUS_LIST = arrayOfAll<RenderStatus>()([
  'FAILED',
  'PENDING',
  'RENDERED',
]);

export const ROUTING_CONFIG_STATUS_LIST = arrayOfAll<RoutingConfigStatus>()([
  'COMPLETED',
  'DELETED',
  'DRAFT',
]);

export const CHANNEL_TYPE_LIST = arrayOfAll<ChannelType>()([
  'primary',
  'secondary',
]);

export const CHANNEL_LIST = arrayOfAll<Channel>()([
  'EMAIL',
  'LETTER',
  'NHSAPP',
  'SMS',
]);

export const CASCADE_GROUP_NAME_LIST = arrayOfAll<CascadeGroupName>()([
  'accessible',
  'translations',
  'standard',
]);
