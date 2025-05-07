'use client';

import { FormErrorState } from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';

export const validate = (
  $schema: z.Schema,
  cb: (value: FormErrorState | undefined) => void
) => {
  return (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);

    const data = Object.fromEntries(formData);

    const validationResult = $schema.safeParse(data);

    if (!validationResult.success) {
      event.preventDefault();

      const error = validationResult.error.flatten();

      cb({
        fieldErrors: error.fieldErrors as Record<string, string[]>,
        formErrors: error.formErrors,
      });
    }
  };
};
