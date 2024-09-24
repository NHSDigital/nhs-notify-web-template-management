import { UnexpectedValidationError } from '@domain/errors';
import { $TemplateSchema, Template } from './templates.types';

export function validateTemplate(source: unknown) {
  const { data, error, success } = $TemplateSchema.safeParse(source);

  if (!success) {
    throw new UnexpectedValidationError({
      message: 'Failed to validate template',
      cause: {
        source,
        errors: error.flatten(),
      },
    });
  }

  return data satisfies Template;
}
