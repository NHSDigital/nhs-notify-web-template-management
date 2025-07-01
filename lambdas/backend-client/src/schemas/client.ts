import z from 'zod';
import { NotifyClient, Features } from '../types/client';
import { schemaFor } from './schema-for';

const $Features = schemaFor<Features>()(
  z.object({
    proofing: z.boolean(),
  })
);

export const $NotifyClient = schemaFor<NotifyClient>()(
  z.object({
    campaignId: z.string().optional(),
    features: $Features,
  })
);
