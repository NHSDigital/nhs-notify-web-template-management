import punycode from 'node:punycode';

// Adapted from core email validation, but only allows nhs.net email addresses
// https://github.com/NHSDigital/comms-mgr/blob/536e6e807154e64752371ec6477facdd14c491b8/packages/libs/utils/src/validators/validate-email-address.ts

export function parseEmailAddress(emailAddress: string): string | null {
  // This email regex is taken from the open-source GOVUK Notify validation code:
  // https://github.com/alphagov/notifications-utils/blob/4a7362676d778b015ea3e7d6fcaf6a0f155c1ab7/notifications_utils/recipients.py#L622C15-L622C15

  const address = emailAddress.toLowerCase().trim();

  if (address.length > 320 || address.includes('..')) {
    return null;
  }

  const emailRegex = /^[\w!#$%&'*+./=?^`{|}~-]+@([^.@][^\s@]+)$/g;
  const regexResult = [...address.matchAll(emailRegex)];

  if (regexResult.length === 0) {
    return null;
  }

  const hostname = punycode.toASCII(regexResult[0][1]);

  if (hostname !== 'nhs.net') {
    return null;
  }

  return address;
}
