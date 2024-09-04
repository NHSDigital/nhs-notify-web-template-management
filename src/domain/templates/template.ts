import { TemplateType } from '@utils/types';

export type TemplateFields = { body: string };

// TODO: perhaps I just use zod instead?
export abstract class Template<TFields extends TemplateFields> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: TemplateType,
    public readonly version: number,
    public readonly fields: TFields
  ) {}

  // TODO: this is pretty difficult to extend TBH. Probably better as a separate validator...
  validate(): { valid: boolean; errors?: string[] } {
    const errors = [];

    if (!this.name) {
      errors.push('Template name is required');
    }

    if (!this.type) {
      errors.push('Template type is required');
    }

    if (!this.version) {
      errors.push('Template version is required');
    }

    if (!this.fields?.body) {
      errors.push('Template fields are required');
    }

    return { valid: errors.length === 0, errors };
  }
}
