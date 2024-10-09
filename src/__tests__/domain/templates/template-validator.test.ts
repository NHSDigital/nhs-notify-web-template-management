import { TemplateInput, validateTemplate } from '@domain/templates';
import { TemplateType } from '@utils/types';

describe('validateTemplate', () => {
  beforeEach(jest.resetAllMocks);

  test.each([TemplateType.NHS_APP, TemplateType.SMS])(
    '%p - should throw error when validation fails',
    (type) => {
      const templateDTO: TemplateInput = {
        fields: { content: undefined as unknown as string },
        name: 'name',
        type,
        version: 1,
      };

      expect(() => validateTemplate(templateDTO)).toThrow(
        'Failed to validate template'
      );
    }
  );

  test.each([TemplateType.NHS_APP, TemplateType.SMS])(
    '%p - should return data when validation passes',
    (type) => {
      const templateDTO: TemplateInput = {
        fields: { content: 'body' },
        name: 'name',
        type,
        version: 1,
      };

      const validatedTemplate = validateTemplate(templateDTO);

      expect(validatedTemplate).toEqual(templateDTO);
    }
  );
});
