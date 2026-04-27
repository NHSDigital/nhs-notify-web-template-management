import punycode from 'punycode/'; // trailing slash is to avoid conflict with deprecated node:punycode module

// Adapted from core email validation
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

  const parts = hostname.split('.');

  if (hostname.length > 253 || parts.length < 2) {
    return null;
  }

  for (const part of parts) {
    if (!part || part.length > 63) {
      return null;
    }

    if (part.startsWith('xn--')) {
      // Punycode: xn-- followed by alphanumeric/hyphens, no trailing hyphen, no more than two consecutive hyphens
      if (
        !/^xn--[\dA-Za-z-]+$/.test(part) ||
        part.endsWith('-') ||
        part.includes('---')
      ) {
        return null;
      }
      // Regular part: alphanumeric with optional hyphens, not starting/ending with hyphen
    } else if (
      !/^[\dA-Za-z-]+$/.test(part) ||
      part.startsWith('-') ||
      part.endsWith('-')
    ) {
      return null;
    }
  }

  const tld = parts.at(-1) as string;

  // TLDs have stricter rules than regular hostname parts
  if (!tld.startsWith('xn--') && !/^[A-Za-z]{2,63}$/.test(tld)) {
    // Standard TLD: must be 2-63 letters only (no digits or hyphens)
    return null;
  }
  // Punycode TLDs (xn--) already validated in the loop above

  return address;
}
