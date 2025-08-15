// This should be in its own package in time - EventBus repo?

import { z } from 'zod';

// https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/formats/json-format.md
// https://nhsd-confluence.digital.nhs.uk/x/pjIxOQ
const $CloudEvent = z.object({
  id: z.string(),
  time: z.iso.datetime(),
  type: z.string(),
  source: z.string(),
  specversion: z.literal('1.0'),
  datacontenttype: z.literal('application/json'),
  subject: z.string(),
  dataschema: z.url(),
  data: z.json(),
});

// Add NHS Notify extensions to base CloudEvent
export const $NHSNotifyEventEnvelope = $CloudEvent.extend({
  dataschemaversion: z.string(),
  plane: z.enum(['data', 'control']),
});

export type NHSNotifyEventEnvelope = z.infer<typeof $NHSNotifyEventEnvelope>;
