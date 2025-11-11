import { ErrorCase } from 'nhs-notify-backend-client';
import { z } from 'zod/v4';
import { ApplicationResult, failure, success } from './result';

export const formatZodErrors = (error: z.ZodError) => {
  const formattedErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const [fieldName = '$root'] = issue.path;
    const errorMessage = issue.message;

    if (typeof fieldName === 'symbol') {
      continue;
    }

    if (!formattedErrors[fieldName]) {
      formattedErrors[fieldName] = [];
    }

    formattedErrors[fieldName].push(errorMessage);
  }

  return Object.fromEntries(
    Object.entries(formattedErrors).map(([key, value]) => [
      key,
      value.join(', '),
    ])
  );
};

export const validate = async <T extends z.Schema>(
  $schema: T,
  dto: unknown
): Promise<ApplicationResult<z.infer<T>>> => {
  const { error, data } = await $schema.safeParseAsync(dto);

  if (error) {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      'Request failed validation',
      error.flatten(),
      formatZodErrors(error)
    );
  }

  return success(data);
};
