import { ZodRawShape, UnknownKeysParam, ZodTypeAny, ZodObject } from 'zod';
import { FormState } from './types';

export const zodValidationServerAction = <
  T extends ZodRawShape,
  U extends UnknownKeysParam,
  V extends ZodTypeAny,
  W extends object,
  X extends FormState,
>(
  formState: X,
  formData: FormData,
  schema: ZodObject<T, U, V, W>
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
    ...parsedForm.data,
  };
};
