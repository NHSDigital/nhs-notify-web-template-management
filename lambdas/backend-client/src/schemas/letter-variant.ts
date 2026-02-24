import { z } from 'zod/v4';
import { LetterVariant } from '../types/generated';

export const $LetterVariant: z.ZodType<LetterVariant> = z
  .object({
    id: z.string(),
    clientId: z.string().optional(),
    campaignId: z.string().optional(),
    status: z.enum(['DISABLED', 'DRAFT', 'INT', 'PROD']),
    type: z.enum(['AUDIO', 'BRAILLE', 'STANDARD']),
    name: z.string(),
    sheetSize: z.string(),
    maxSheets: z.number(),
    bothSides: z.boolean(),
    printColour: z.string(),
    envelopeSize: z.string(),
    dispatchTime: z.string(),
    postage: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.campaignId && !data.clientId) {
      ctx.addIssue({
        code: 'custom',
        path: ['clientId'],
        message: 'clientId is required when campaignId is set',
      });
    }
  });
