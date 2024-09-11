import { UnexpectedValidationError } from '@domain/errors';
import { $TemplateSchema } from '@domain/templates/templates.types';
import { z } from 'zod';

const $NHSAppTemplateSchema = $TemplateSchema.extend({
  type: z.literal('NHS_APP'),
});

export type NHSAppTemplateData = {
  name: string;
  fields: { content: string };
};

export class NHSAppTemplate {
  public readonly name: string;
  public readonly fields: { content: string };
  public readonly version: number;
  public readonly type: 'NHS_APP';

  private constructor(name: string, fields: { content: string }) {
    this.name = name;
    this.fields = fields;
    this.version = 1;
    this.type = 'NHS_APP';
  }

  static create({ name, fields }: NHSAppTemplateData) {
    this.validate({ name, fields });
    return new NHSAppTemplate(name, fields);
  }

  static validate({ name, fields }: NHSAppTemplateData) {
    const { error } = $NHSAppTemplateSchema.safeParse({
      name,
      fields,
    });

    if (error) {
      throw new UnexpectedValidationError({
        message: error.message,
        cause: error,
      });
    }
  }

  toPrimitive() {
    return {
      name: this.name,
      fields: this.fields,
      version: this.version,
      type: this.type,
    };
  }
}

const template = NHSAppTemplate.create({
  name: 'test',
  fields: { content: 'test' },
});
