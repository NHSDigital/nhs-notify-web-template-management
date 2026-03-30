import { z } from 'zod/v4';
import type {
  ClientConfiguration,
  ClientFeatures,
} from 'nhs-notify-web-template-management-types';
import { schemaFor } from './schema-for';

const $ClientFeatures = schemaFor<ClientFeatures>()(
  z.object({
    proofing: z.boolean(),
    routing: z.boolean().optional(),
    letterAuthoring: z.boolean().optional(),
    digitalProofingNhsApp: z.boolean().optional(),
    digitalProofingEmail: z.boolean().optional(),
    digitalProofingSms: z.boolean().optional(),
  })
);

export const $ClientConfiguration = schemaFor<ClientConfiguration>()(
  z.object({
    campaignId: z.string().optional(),
    campaignIds: z.array(z.string()).optional(),
    features: $ClientFeatures,
  })
);
