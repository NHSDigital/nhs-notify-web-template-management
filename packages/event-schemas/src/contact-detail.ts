import { z } from 'zod';

export const $ContactDetailVerificationRequestedEventData = z
  .object({
    id: z.uuidv4().meta({
      description:
        'Unique identifier of the contact detail verification request',
    }),
    type: z.enum(['EMAIL', 'SMS']).meta({
      description: 'Type of contact detail that requires verification',
    }),
    value: z
      .string()
      .meta({ description: 'Contact detail that requires verification' }),
    otp: z
      .string()
      .regex(/^\d{6}$/)
      .meta({
        description:
          'OTP to include in the contact detail verification message',
      }),
  })
  .meta({
    id: 'ContactDetailVerificationRequestedEventData',
  });
