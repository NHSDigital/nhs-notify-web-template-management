import { z } from 'zod';

// eslint-disable-next-line security/detect-unsafe-regex
const UUID_REGEX = /^[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/;

const $BaseProofRequestEventData = z.object({
  id: z.string().regex(UUID_REGEX).meta({
    description: 'Unique identifier of the proof request',
  }),
  templateId: z.string().regex(UUID_REGEX).meta({
    description: 'Unique identifier for the template being proofed',
  }),
  testPatientNhsNumber: z.string().meta({
    description: 'NHS number of test patient to use in the proofing request',
  }),
  personalisation: z.record(z.string(), z.string()).optional().meta({
    description: 'Personalisation fields to use in the proof',
  }),
});

const $ProofContactDetails = z
  .object({
    sms: z.string().optional(),
    email: z.string().optional(),
  })
  .meta({ description: 'Contact details to send the proof to' });

export const $ProofRequestSMSEventData = $BaseProofRequestEventData.extend({
  templateType: z.literal('SMS').meta({
    description: 'Template type for the template being proofed',
  }),
  contactDetails: $ProofContactDetails.extend({
    sms: z.string(),
  }),
});

export const $ProofRequestEmailEventData = $BaseProofRequestEventData.extend({
  templateType: z.literal('EMAIL').meta({
    description: 'Template type for the template being proofed',
  }),
  contactDetails: $ProofContactDetails.extend({
    email: z.string(),
  }),
});

export const $ProofRequestNHSAppEventData = $BaseProofRequestEventData.extend({
  templateType: z.literal('NHS_APP').meta({
    description: 'Template type for the template being proofed',
  }),
  contactDetails: $ProofContactDetails.optional(),
});

export const $ProofRequestEventData = z
  .discriminatedUnion('templateType', [
    $ProofRequestNHSAppEventData,
    $ProofRequestSMSEventData,
    $ProofRequestEmailEventData,
  ])
  .meta({
    id: 'ProofRequestEventData',
  });
