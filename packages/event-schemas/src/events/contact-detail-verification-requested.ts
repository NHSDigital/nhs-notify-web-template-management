import { z } from 'zod';
import { $ContactDetailVerificationRequestedEventData } from '../contact-detail';
import { $NHSNotifyEventEnvelope } from '../event-envelope';

export const $ContactDetailVerificationRequestedEventV1 =
  $NHSNotifyEventEnvelope.extend({
    type: z.literal(
      'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1'
    ),
    dataschema: z.literal(
      'https://notify.nhs.uk/events/schemas/ContactDetailVerificationRequested/v1.json'
    ),
    dataschemaversion: z.string().startsWith('1.'),
    plane: z.literal('data'),
    data: $ContactDetailVerificationRequestedEventData,
  });

export type ContactDetailVerificationRequestedEventV1 = z.infer<
  typeof $ContactDetailVerificationRequestedEventV1
>;
