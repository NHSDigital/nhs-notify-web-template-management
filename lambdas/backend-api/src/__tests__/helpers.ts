import { ContactDetailVerificationRequestedEventV1 } from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { LetterVariant } from 'nhs-notify-web-template-management-types';

export const makeLetterVariant = (
  overrides: Partial<LetterVariant> = {}
): LetterVariant => ({
  id: 'variant-1',
  name: 'Standard C5',
  sheetSize: 'A4',
  maxSheets: 5,
  bothSides: true,
  printColour: 'black',
  envelopeSize: 'C5',
  dispatchTime: 'standard',
  postage: 'economy',
  status: 'PROD',
  type: 'STANDARD',
  ...overrides,
});

export const makeContactDetailVerificationRequestedEvent = (
  overrides: Partial<ContactDetailVerificationRequestedEventV1> = {}
): ContactDetailVerificationRequestedEventV1 => ({
  data: {
    id: '120711be-ccd7-4104-a12a-b14ef668a815',
    type: 'EMAIL',
    value: 'user@example.com',
    otp: '123456',
  },
  datacontenttype: 'application/json',
  dataschema:
    'https://notify.nhs.uk/events/schemas/ContactDetailVerificationRequested/v1.json',
  dataschemaversion: '1.0.0',
  id: '8681f3a6-3553-492f-aab1-25c86fade338',
  plane: 'data',
  source: 'template-management',
  specversion: '1.0',
  subject: '120711be-ccd7-4104-a12a-b14ef668a815',
  time: '2026-04-27T10:30:00.000Z',
  type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
  ...overrides,
});
