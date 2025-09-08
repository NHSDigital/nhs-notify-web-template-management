// This should be in its own package in time - EventBus repo?

import { z } from 'zod';

// https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/formats/json-format.md
// https://nhsd-confluence.digital.nhs.uk/x/pjIxOQ
const $CloudEvent = z.object({
  id: z.uuid().meta({
    description: 'Unique ID for this event'
  }),
  time: z.iso.datetime().meta({
    description: 'Time the event was generated'
  }),
  type: z.string().meta({
    description: 'Type of event'
  }),
  source: z.string().meta({
    description: 'Source of the event'
  }),
  specversion: z.literal('1.0').meta({
    description: 'Version of the envelope event schema'
  }),
  datacontenttype: z.literal('application/json').meta({
    description: 'Always application/json'
  }),
  subject: z.uuid().meta({
    description: 'Unique identifier for the item in the event data'
  }),
  dataschema: z.url().meta({
    description: 'Schema for this event'
  }),
});

// Add NHS Notify extensions to base CloudEvent
export const $NHSNotifyEventEnvelope = $CloudEvent.extend({
  dataschemaversion: z.string(),
  plane: z.enum(['data', 'control']),
}).meta({
  id: 'NHSNotifyEventEnvelope',
});

export type NHSNotifyEventEnvelope = z.infer<typeof $NHSNotifyEventEnvelope>;
