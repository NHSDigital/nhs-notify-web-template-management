import {
  CreateTemplate,
  isCreateTemplateValid,
  isTemplateDtoValid,
  isUpdateTemplateValid,
  TemplateDto,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import { $CreateTemplateSchema, $UpdateTemplateSchema } from '../../schemas';

describe('Template schemas', () => {
  test.each([
    {
      schema: $CreateTemplateSchema,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(100_001),
        subject: 'Test Subject',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateTemplateSchema,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(919),
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateTemplateSchema,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(5001),
        templateType: 'NHS_APP',
      },
    },
  ])(
    '%p.templateType - should fail validation, when max character length exceeded',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            message: [
              `String must contain at most ${data.message.length - 1} character(s)`,
            ],
          },
        })
      );
    }
  );

  test.each([
    {
      schema: $CreateTemplateSchema,
      data: {
        name: ' ',
        message: ' ',
        subject: ' ',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateTemplateSchema,
      data: {
        name: ' ',
        message: ' ',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateTemplateSchema,
      data: {
        name: ' ',
        message: ' ',
        templateType: 'NHS_APP',
      },
    },
  ])(
    '%p.templateType - should fail validation, when name, message or subject is whitespace',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'String must contain at least 1 character(s)';

      const errors = {
        fieldErrors: {
          message: [errorMessage],
          name: [errorMessage],
        },
      };

      if (data.templateType === 'EMAIL') {
        Object.assign(errors.fieldErrors, {
          subject: [errorMessage],
        });
      }

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test.each([
    {
      schema: $CreateTemplateSchema,
      data: {
        name: '',
        message: '',
        subject: '',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateTemplateSchema,
      data: {
        name: '',
        message: '',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateTemplateSchema,
      data: {
        name: '',
        message: '',
        templateType: 'NHS_APP',
      },
    },
  ])(
    '%p - should fail validation, when name, message or subject is empty',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'String must contain at least 1 character(s)';

      const errors = {
        fieldErrors: {
          message: [errorMessage],
          name: [errorMessage],
        },
      };

      if (data.templateType === 'EMAIL') {
        Object.assign(errors.fieldErrors, {
          subject: [errorMessage],
        });
      }

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test('$EmailTemplateFields - should fail validation, when no subject', async () => {
    const result = $CreateTemplateSchema.safeParse({
      name: 'Test Template',
      message: 'a'.repeat(100_000),
      templateType: 'EMAIL',
    });

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          subject: ['Required'],
        },
      })
    );
  });

  test.each([
    '<element>failed</element>',
    '<element><nested>nested</nested></element>',
    '<element attribute="failed">failed</element>',
  ])(
    '$NhsAppTemplateFields - should fail validation, when invalid characters are present %p',
    async (message) => {
      const result = $CreateTemplateSchema.safeParse({
        name: 'Test Template',
        message,
        templateType: 'NHS_APP',
      });

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            message: [
              'Message contains disallowed characters. Disallowed characters: <(.|\n)*?>',
            ],
          },
        })
      );
    }
  );

  describe('$CreateTemplateSchema', () => {
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
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
        files: {
          pdfTemplate: {
            fileName: 'template.pdf',
            currentVersion: '123',
            virusScanStatus: 'FAILED',
          },
        },
      },
    ])('should pass validation %p', async (template) => {
      const result = $CreateTemplateSchema.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });

  describe('$UpdateTemplateSchema', () => {
    const commonFields = {
      name: 'Test Template',
      templateStatus: 'SUBMITTED',
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
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
        files: {
          pdfTemplate: {
            fileName: 'template.pdf',
            currentVersion: '57d8yds',
            virusScanStatus: 'PASSED',
          },
        },
      },
    ])('should pass validation %p', async (template) => {
      const result = $UpdateTemplateSchema.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });

  describe('isCreateTemplateValid', () => {
    const template: CreateTemplate = {
      name: 'Test Template',
      message: 'This is a test template',
      templateType: 'NHS_APP',
    };

    test('Should return template on pass', async () => {
      const result = isCreateTemplateValid(template);

      expect(result).toEqual(template);
    });

    test('Should return undefined on fail', async () => {
      const result = isCreateTemplateValid({
        ...template,
        name: undefined,
      });

      expect(result).toEqual(undefined);
    });
  });

  describe('isUpdateTemplateValid', () => {
    const template: UpdateTemplate = {
      name: 'Test Template',
      message: 'This is a test template',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
    };

    test('Should return template on pass', async () => {
      const result = isUpdateTemplateValid(template);

      expect(result).toEqual(template);
    });

    test('Should return undefined on fail', async () => {
      const result = isUpdateTemplateValid({
        ...template,
        name: undefined,
      });

      expect(result).toEqual(undefined);
    });
  });

  describe('isTemplateDtoValid', () => {
    const template: TemplateDto = {
      name: 'Test Template',
      message: 'This is a test template',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      id: 'id',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    };

    test('Should return template on pass', async () => {
      const result = isTemplateDtoValid(template);

      expect(result).toEqual(template);
    });

    test('Should return undefined on fail', async () => {
      const result = isTemplateDtoValid({
        ...template,
        name: undefined,
      });

      expect(result).toEqual(undefined);
    });
  });
});
