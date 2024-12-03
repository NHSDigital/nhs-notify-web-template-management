/*
 * Allowed character length and disallowed characters for NHS App, Email and SMS templates
 * https://digital.nhs.uk/developer/api-catalogue/nhs-app#post-/communication/in-app/FHIR/R4/CommunicationRequest
 * https://digital.nhs.uk/developer/api-catalogue/nhs-notify#overview--message-character-limits
 */
// eslint-disable-next-line sonarjs/slow-regex
export const NHS_APP_DISALLOWED_CHARACTERS = '<(.|\n)*?>';
export const MAX_NHS_APP_CHARACTER_LENGTH = 5000 as const;
export const MAX_SMS_CHARACTER_LENGTH = 918 as const;
export const MAX_EMAIL_CHARACTER_LENGTH = 100_000 as const;
