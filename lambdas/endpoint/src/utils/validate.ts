import { ErrorCase, failure, Result, success } from "nhs-notify-templates-client";
import { z } from "zod";

export const validate = <T extends z.Schema>($schema: T, dto: unknown): Result<z.infer<T>> => {
  const { error, data } = $schema.safeParse(dto);

  if (error) {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      'Request failed validation',
      error.flatten()
    );
  }

  return success(data);
}
