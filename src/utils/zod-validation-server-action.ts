import { ZodRawShape, UnknownKeysParam, ZodTypeAny, ZodObject } from 'zod';
import { FormState, Page } from './types';

export const zodValidationServerAction = <
  T extends ZodRawShape,
  U extends UnknownKeysParam,
  V extends ZodTypeAny,
  W extends Partial<FormState>,
>(
  formState: FormState,
  formData: FormData,
  schema: ZodObject<T, U, V, W>,
  page?: Page
) => {
  const form = Object.fromEntries(formData.entries());

  const parsedForm = schema.safeParse(form);

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  return {
    ...formState,
    validationError: undefined,
    ...(page && { page }),
    ...parsedForm.data,
  };
};
