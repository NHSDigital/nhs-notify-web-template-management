import { TemplateInput, validateTemplate } from '@domain/templates';
import { TemplateType } from '@utils/types';

describe('validateTemplate', () => {
  beforeEach(jest.resetAllMocks);

  it('should throw error when validation fails', () => {
    const templateDTO: TemplateInput = {
      fields: { content: undefined as unknown as string },
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
    };

    expect(() => validateTemplate(templateDTO)).toThrow(
      'Failed to validate template'
    );
  });

  it('should return data when validation passes', () => {
    const templateDTO: TemplateInput = {
      fields: { content: 'body' },
      name: 'name',
      type: TemplateType.NHS_APP,
      version: 1,
    };

    const validatedTemplate = validateTemplate(templateDTO);

    expect(validatedTemplate).toEqual(templateDTO);
  });
});
