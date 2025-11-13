import {
  $UploadLetterProperties,
  $CreateUpdateNonLetter,
  $CreateUpdateTemplate,
} from '../../schemas';
import type { CreateUpdateTemplate } from '../../types/generated';

describe('Template schemas', () => {
  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(100_001),
        subject: 'Test Subject',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(919),
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(5001),
        templateType: 'NHS_APP',
      },
    },
  ])(
    '$data.templateType - should fail validation, when max character length exceeded',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            message: [
              `Too big: expected string to have <=${data.message.length - 1} characters`,
            ],
          },
        })
      );
    }
  );

  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        message: ' ',
        subject: ' ',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        message: ' ',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        message: ' ',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        templateType: 'LETTER',
        campaignId: 'campaign-id',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '$data.templateType - should fail validation, when name, message or subject is whitespace',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'Too small: expected string to have >=1 characters';

      const emptyFields = Object.entries(data).flatMap(([k, v]) =>
        v === ' ' ? [k] : []
      );

      const errors = {
        fieldErrors: Object.fromEntries(
          emptyFields.map((field) => [field, [errorMessage]])
        ),
      };

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        message: '',
        subject: '',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        message: '',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        message: '',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        templateType: 'LETTER',
        campaignId: 'campaign-id',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '$data.templateType - should fail validation, when name, message or subject is empty',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'Too small: expected string to have >=1 characters';

      const emptyFields = Object.entries(data).flatMap(([k, v]) =>
        v === '' ? [k] : []
      );

      const errors = {
        fieldErrors: Object.fromEntries(
          emptyFields.map((field) => [field, [errorMessage]])
        ),
      };

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test('$CreateUpdateNonLetter should fail when input is a letter', () => {
    const letter: CreateUpdateTemplate = {
      templateType: 'LETTER',
      letterType: 'x1',
      language: 'ar',
      name: 'letter',
      campaignId: 'campaign-id',
    };

    const result = $CreateUpdateNonLetter.safeParse(letter);

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          templateType: ['Invalid input'],
        },
      })
    );
  });

  test('Email template fields - should fail validation, when no subject', async () => {
    const result = $CreateUpdateTemplate.safeParse({
      name: 'Test Template',
      message: 'a'.repeat(100_000),
      templateType: 'EMAIL',
    });

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          subject: ['Invalid input: expected string, received undefined'],
        },
      })
    );
  });

  test('Letter template fields - should fail validation, when no letterType', async () => {
    const result = $UploadLetterProperties.safeParse({
      name: 'Test Template',
      campaignId: 'campaign-id',
      templateType: 'LETTER',
      language: 'en',
    });

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          letterType: ['Invalid option: expected one of "q4"|"x0"|"x1"'],
        },
      })
    );
  });

  describe('$CreateUpdateTemplate', () => {
    const commonFields = {
      name: 'Test Template',
    };

    test.each([
      {
        ...commonFields,
        subject: 'Test Subject',
        message: 'This is a test template',
        templateType: 'EMAIL',
      },
      {
        ...commonFields,
        message: 'This is a test template',
        templateType: 'SMS',
      },
      {
        ...commonFields,
        message: 'This is a test template',
        templateType: 'NHS_APP',
      },
      {
        ...commonFields,
        campaignId: 'campaign-id',
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
      },
    ])('should pass validation %p', async (template) => {
      const result = $CreateUpdateTemplate.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });
});
