/*
 * Allowed character length for NHS App, Email and SMS templates
 * (app disallowed characters are handled by html encoding)
 * https://digital.nhs.uk/developer/api-catalogue/nhs-app#post-/communication/in-app/FHIR/R4/CommunicationRequest
 * https://digital.nhs.uk/developer/api-catalogue/nhs-notify#overview--message-character-limits
 */
export const MAX_NHS_APP_CHARACTER_LENGTH = 5000 as const;
export const MAX_SMS_CHARACTER_LENGTH = 918 as const;
export const MAX_EMAIL_CHARACTER_LENGTH = 100_000 as const;

/*
 * Specification for multipart form data
 */
export const LETTER_MULTIPART = {
  TEMPLATE: {
    name: 'template',
  },
  PDF: {
    name: 'letterPdf',
    fileType: 'application/pdf',
  },
  CSV: {
    name: 'testCsv',
    fileType: 'text/csv',
  },
  DOCX: {
    name: 'docxTemplate',
    fileType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
};
