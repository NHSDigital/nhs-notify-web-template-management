import { z } from 'zod';
import { $NHSNotifyEventEnvelope } from '../event-envelope';
import { $ProofRequestEventData } from '../proof-request';

export const $ProofRequestedEventV1 = $NHSNotifyEventEnvelope.extend({
  type: z.literal('uk.nhs.notify.template-management.ProofRequested.v1'),
  dataschema: z.literal(
    'https://notify.nhs.uk/events/schemas/ProofRequested/v1.json'
  ),
  dataschemaversion: z.string().startsWith('1.'),
  plane: z.literal('data'),
  data: $ProofRequestEventData,
});

export type ProofRequestedEventV1 = z.infer<typeof $ProofRequestedEventV1>;
