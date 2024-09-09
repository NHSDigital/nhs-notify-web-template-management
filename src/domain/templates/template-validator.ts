import { TemplateType } from '@utils/types';
import { ValidationError } from '@domain/errors';
import { z } from 'zod';
import { $NHSAppTemplateSchema, Template } from './templates.types';

const schemaMap: Record<TemplateType, z.Schema<unknown>> = {
  [TemplateType.NHS_APP]: $NHSAppTemplateSchema,
  [TemplateType.SMS]: z.object({}),
  [TemplateType.EMAIL]: z.object({}),
  [TemplateType.LETTER]: z.object({}),
};

export function validateTemplate<TDestination extends Template>(
  type: TemplateType,
  source: unknown
) {
  const templateSchema = schemaMap[type];

  const { data, error } = templateSchema.safeParse(source);

  if (error) {
    throw new ValidationError({
      message: `${type} template is invalid`,
      cause: error.flatten(),
    });
  }

  if (!data) {
    throw new ValidationError({
      message: `Mapped source fields onto ${type} template but ${type} template returned falsy with no errors`,
      cause: {
        message: `Source fields attempting to be mapped onto ${type} template`,
        data: source,
      },
    });
  }

  return data as TDestination;
}
