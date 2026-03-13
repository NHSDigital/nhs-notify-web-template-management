import { z } from 'zod';

//eslint-disable-next-line security/detect-unsafe-regex
const UUID_REGEX = /^[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/;

export const $ProofRequestEventData = z
  .object({
    id: z.string().regex(UUID_REGEX).meta({
      description: 'Unique identifier of the proof request',
    }),
    templateId: z.string().regex(UUID_REGEX).meta({
      description: 'Unique identifier for the template being proofed',
    }),
    templateType: z.enum(['NHS_APP', 'SMS', 'EMAIL']).meta({
      description: 'Template type for the template being proofed',
    }),
    testPatientNhsNumber: z.string().meta({
      description: 'NHS number of test patient to use in the proofing request',
    }),
    contactDetails: z
      .object({
        sms: z.string().optional(),
        email: z.string().optional(),
      })
      .optional()
      .meta({ description: 'Contact details to send the proof to' }),
    personalisation: z.record(z.string(), z.string()).optional().meta({
      description: 'Personalisation fields to use in the proof',
    }),
  })
  .meta({
    id: 'ProofRequestEventData',
  });
