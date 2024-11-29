import { ErrorCase } from 'nhs-notify-backend-client';
import { z } from 'zod';
import { ApplicationResult, failure, success } from './result';

export const validate = <T extends z.Schema>(
  $schema: T,
  dto: unknown
): ApplicationResult<z.infer<T>> => {
  const { error, data } = $schema.safeParse(dto);

  if (error) {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      'Request failed validation',
      error.flatten()
    );
  }

  return success(data);
};
