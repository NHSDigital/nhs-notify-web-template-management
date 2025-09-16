import { z } from 'zod/v4';
import type { RoutingConfig } from '../types/generated';
import { schemaFor } from './schema-for';

export const $RoutingConfig = schemaFor<RoutingConfig>()(
  z.object({
    id: z.uuidv4(),
    owner: z.string(),
    status: z.enum(['DELETED', 'DRAFT']),
  })
);
