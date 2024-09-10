import { Template, validateTemplate } from '@domain/templates';
import { TemplateType } from '@utils/types';
import { $TemplateSchema } from '@domain/templates/templates.types';
import { z } from 'zod';

describe('validateTemplate', () => {
  beforeEach(jest.resetAllMocks);

  it('should throw error when validation fails', () => {
    const templateDTO: Template = {
      fields: { content: undefined as unknown as string },
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
    };

    expect(() => validateTemplate(templateDTO)).toThrow(
      'Failed to validate template'
    );
  });

  it('should throw error trying to validate against the wrong schema', () => {
    const templateDTO: Template = {
      fields: { content: 'body' },
      name: 'name',
      type: TemplateType.EMAIL,
      version: 1,
    };
    expect(() => validateTemplate(templateDTO)).toThrow(
      'Failed to validate template'
    );
  });

  it('should return data when validation passes', () => {
    const templateDTO: Template = {
      fields: { content: 'body' },
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
    };

    const validatedTemplate = validateTemplate(templateDTO);

    expect(validatedTemplate).toEqual(templateDTO);
  });
});
