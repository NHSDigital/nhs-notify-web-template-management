import { z } from 'zod';

export const TemplatePublished = {
  '0.1.0': z.object({
    id: z.string(),
    name: z.string(),
    client: z.string(),
    campaign: z.string(),
    channel: z.string()
  })
}
