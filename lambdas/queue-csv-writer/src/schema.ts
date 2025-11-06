import { z } from 'zod';

// Accept any object for data payload; passthrough preserves arbitrary keys.
export const $MessageEnvelope = z.object({
  data: z.object({}).passthrough()
});

export type MessageEnvelope = z.infer<typeof $MessageEnvelope>;