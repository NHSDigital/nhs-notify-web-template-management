import { z } from 'zod';

export const parseJsonPreprocessor = (value: unknown, ctx: z.RefinementCtx) => {
  try {
    return JSON.parse(value as string);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: (error as Error)?.message,
    });
  }

  return value;
};
