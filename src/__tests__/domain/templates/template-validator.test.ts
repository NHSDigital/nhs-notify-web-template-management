import { Template, validateTemplate } from '@domain/templates';
import { TemplateType } from '@utils/types';
import { $NHSAppTemplateSchema } from '@domain/templates/templates.types';
import { z } from 'zod';

describe('validateTemplate', () => {
  beforeEach(jest.resetAllMocks);

  it('should throw error when validation fails', () => {
    const templateDTO: Template = {
      fields: { body: undefined as unknown as string },
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
    };

    expect(() => validateTemplate(TemplateType.NHS_APP, templateDTO)).toThrow(
      'NHS_APP template is invalid'
    );
  });

  it('should throw error trying to validate against the wrong schema', () => {
    const templateDTO: Template = {
      fields: { body: 'body' },
      name: 'name',
      type: TemplateType.EMAIL,
      version: 1,
    };
    expect(() => validateTemplate(TemplateType.NHS_APP, templateDTO)).toThrow(
      'NHS_APP template is invalid'
    );
  });

  it('should throw error when validation passes but no data is returned', () => {
    const spy = jest
      .spyOn($NHSAppTemplateSchema, 'safeParse')
      .mockReturnValueOnce({} as z.SafeParseReturnType<unknown, never>);

    const templateDTO: Template = {
      fields: { body: 'body' },
      name: 'name',
      type: TemplateType.EMAIL,
      version: 1,
    };

    expect(() => validateTemplate(TemplateType.NHS_APP, templateDTO)).toThrow(
      'Mapped source fields onto NHS_APP template but NHS_APP template returned falsy with no errors'
    );

    spy.mockRestore();
  });

  it('should return data when validation passes', () => {
    const templateDTO: Template = {
      fields: { body: 'body' },
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
    };

    const validatedTemplate = validateTemplate(
      TemplateType.NHS_APP,
      templateDTO
    );

    expect(validatedTemplate).toEqual(templateDTO);
  });
});
