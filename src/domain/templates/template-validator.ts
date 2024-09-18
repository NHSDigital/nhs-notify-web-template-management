import { UnexpectedValidationError } from '@domain/errors';
import { $TemplateInput, TemplateInput } from './templates.types';

export function validateTemplate(source: unknown) {
  const { data, error, success } = $TemplateInput.safeParse(source);

  if (!success) {
    throw new UnexpectedValidationError({
      message: 'Failed to validate template',
      cause: {
        source,
        errors: error.flatten(),
      },
    });
  }

  return data satisfies TemplateInput;
}
