import z from 'zod';
import { IClientConfiguration, Features } from '../types/client-configuration';
import { schemaFor } from './schema-for';

const $Features = schemaFor<Features>()(
  z.object({
    proofing: z.boolean(),
  })
);

export const $ClientConfiguration = schemaFor<IClientConfiguration>()(
  z.object({
    campaignId: z.string().optional(),
    features: $Features,
  })
);
