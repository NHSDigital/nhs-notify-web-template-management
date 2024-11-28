import { z } from 'zod';

export const $User = z.object({
  client_id: z.string(),
});
