import {
  CountryCode,
  isPossiblePhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/max';

const PERMITTED_COUNTRY_CODES = new Set<CountryCode>(['GB', 'GG', 'IM', 'JE']);

/**
 * Adapted from core phone number validation. Only allows UK/Crown Dependency mobile numbers.
 * https://github.com/NHSDigital/comms-mgr/blob/536e6e807154e64752371ec6477facdd14c491b8/packages/libs/utils/src/validators/validate-phone-number.ts
 * @returns String - E.164 format phone number
 * @returns null - if the phone number is not valid
 */
export function parsePhoneNumber(phoneNumber: string): string | null {
  if (phoneNumber.trim() === '') {
    return null;
  }

  const normalisedNumber = phoneNumber
    .replaceAll(/\s+/g, ' ') // Normalize whitespace.
    .replaceAll(/[\u200B\uFEFF]/g, '') // Remove zero-width characters.
    .replace(/^(\+00|00)(?=\d{1,3})/, '+') // Convert '+00' or '00' to '+'.
    .trim();

  if (!/^[\d ()+-]+$/.test(normalisedNumber)) {
    // Reject numbers with leading and/or trailing invalid characters.
    // libphonenumber-js is happy with them, but GUKN isn't.

    return null;
  }

  let parsedNumber = parsePhoneNumberFromString(normalisedNumber, 'GB');

  if (!parsedNumber?.isValid()) {
    const forcedNumber = normalisedNumber.startsWith('+')
      ? normalisedNumber
      : `+${normalisedNumber}`;

    if (isPossiblePhoneNumber(forcedNumber)) {
      parsedNumber = parsePhoneNumberFromString(forcedNumber);
    }
  }

  if (
    !parsedNumber ||
    !PERMITTED_COUNTRY_CODES.has(parsedNumber.country!) ||
    parsedNumber.getType() !== 'MOBILE'
  ) {
    return null;
  }

  return parsedNumber.number;
}
