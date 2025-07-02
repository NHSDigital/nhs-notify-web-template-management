import z from 'zod';
import { schemaFor } from './schema-for';
import { Client, ClientFeatures } from '../types/generated';

const $ClientFeatures = schemaFor<ClientFeatures>()(
  z.object({
    proofing: z.boolean(),
  })
);

export const $Client = schemaFor<Client>()(
  z.object({
    campaignId: z.string().optional(),
    features: $ClientFeatures,
  })
);
