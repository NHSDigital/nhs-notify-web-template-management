import { z } from 'zod/v4';
import type { ContactDetailInputNormalized } from 'nhs-notify-web-template-management-types';
import { parsePhoneNumber } from './phone-number';
import { parseEmailAddress } from './email';

const $ContactDetailInputEmail = z.object({
  type: z.literal('EMAIL'),
  value: z.string(),
});

const $ContactDetailInputSms = z.object({
  type: z.literal('SMS'),
  value: z.string(),
});

const $ContactDetailInputEmailValidated = $ContactDetailInputEmail.transform(
  (input, ctx) => {
    const parsed = parseEmailAddress(input.value);

    if (parsed) {
      return {
        type: input.type,
        value: parsed,
        rawValue: input.value,
      };
    }

    ctx.issues.push({
      code: 'custom',
      path: ['value'],
      message: 'Invalid email address',
      input: input.value,
    });

    return z.NEVER;
  }
);

const $ContactDetailInputSmsValidated = $ContactDetailInputSms.transform(
  (input, ctx) => {
    const parsed = parsePhoneNumber(input.value);

    if (parsed) {
      return {
        type: input.type,
        value: parsed,
        rawValue: input.value,
      };
    }

    ctx.issues.push({
      code: 'custom',
      path: ['value'],
      message: 'Invalid phone number',
      input: input.value,
    });

    return z.NEVER;
  }
);

export const $ContactDetailInputNormalized: z.ZodType<ContactDetailInputNormalized> =
  z.discriminatedUnion('type', [
    $ContactDetailInputEmailValidated,
    $ContactDetailInputSmsValidated,
  ]);
