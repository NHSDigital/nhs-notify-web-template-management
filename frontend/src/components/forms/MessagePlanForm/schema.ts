import { z } from 'zod/v4';

export const $MessagePlanFormData = z.object({
  campaignId: z.string().min(1, { error: 'Select a campaign' }),
  name: z
    .string()
    .min(1, { error: 'Enter a message plan name' })
    .max(200, { error: 'Message plan name too long' }),
});
