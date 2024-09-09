import { Template, validateTemplate } from '@domain/templates';
import { Session, TemplateType } from '@utils/types';

describe('validateTemplate', () => {
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
