import z from 'zod';
import { schemaFor } from './schema-for';
import { ClientConfiguration, ClientFeatures } from '../types/generated';

const $ClientFeatures = schemaFor<ClientFeatures>()(
  z.object({
    proofing: z.boolean(),
  })
);

export const $ClientConfiguration = schemaFor<ClientConfiguration>()(
  z.object({
    campaignId: z.string().optional(),
    features: $ClientFeatures,
  })
);
