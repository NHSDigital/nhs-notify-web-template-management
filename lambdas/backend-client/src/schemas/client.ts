import { z } from 'zod/v4';
import { schemaFor } from './schema-for';
import { ClientConfiguration, ClientFeatures } from '../types/generated';

const $ClientFeatures = schemaFor<ClientFeatures>()(
  z.object({
    proofing: z.boolean(),
    routing: z.boolean().optional(),
  })
);

export const $ClientConfiguration = schemaFor<ClientConfiguration>()(
  z.object({
    campaignId: z.string().optional(),
    features: $ClientFeatures,
  })
);
