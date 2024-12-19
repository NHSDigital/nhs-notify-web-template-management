import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';
import {
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
  $EmailTemplateFields,
  $SMSTemplateFields,
  $NHSAppTemplateFields,
} from '../../schemas';

describe('Template schemas', () => {
  test.each([
    {
      schema: $EmailTemplateFields,
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        subject: 'Test Subject',
        templateType: TemplateType.EMAIL,
      },
    },
    {
      schema: $SMSTemplateFields,
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        templateType: TemplateType.SMS,
      },
    },
    {
      schema: $NHSAppTemplateFields,
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        templateType: TemplateType.NHS_APP,
      },
    },
  ])('%p.templateType - should pass validation', async ({ schema, data }) => {
    const result = schema.safeParse(data);

    expect(result.data).toEqual(data);
  });

  test.each([
    {
      schema: $EmailTemplateFields,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(100_001),
        subject: 'Test Subject',
        templateType: TemplateType.EMAIL,
      },
    },
    {
      schema: $SMSTemplateFields,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(919),
        templateType: TemplateType.SMS,
      },
    },
    {
      schema: $NHSAppTemplateFields,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(5001),
        templateType: TemplateType.NHS_APP,
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
      schema: $EmailTemplateFields,
      data: {
        name: ' ',
        message: ' ',
        subject: ' ',
        templateType: TemplateType.EMAIL,
      },
    },
    {
      schema: $SMSTemplateFields,
      data: {
        name: ' ',
        message: ' ',
        templateType: TemplateType.SMS,
      },
    },
    {
      schema: $NHSAppTemplateFields,
      data: {
        name: ' ',
        message: ' ',
        templateType: TemplateType.NHS_APP,
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

      if (data.templateType === TemplateType.EMAIL) {
        Object.assign(errors.fieldErrors, {
          subject: [errorMessage],
        });
      }

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test.each([
    {
      schema: $EmailTemplateFields,
      data: {
        name: '',
        message: '',
        subject: '',
        templateType: TemplateType.EMAIL,
      },
    },
    {
      schema: $SMSTemplateFields,
      data: {
        name: '',
        message: '',
        templateType: TemplateType.SMS,
      },
    },
    {
      schema: $NHSAppTemplateFields,
      data: {
        name: '',
        message: '',
        templateType: TemplateType.NHS_APP,
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

      if (data.templateType === TemplateType.EMAIL) {
        Object.assign(errors.fieldErrors, {
          subject: [errorMessage],
        });
      }

      expect(result.error?.flatten()).toEqual(expect.objectContaining(errors));
    }
  );

  test('$EmailTemplateFields - should fail validation, when no subject', async () => {
    const result = $EmailTemplateFields.safeParse({
      name: 'Test Template',
      message: 'a'.repeat(100_000),
      templateType: TemplateType.EMAIL,
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
      const result = $NHSAppTemplateFields.safeParse({
        name: 'Test Template',
        message,
        templateType: TemplateType.NHS_APP,
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
      message: 'This is a test template',
    };

    test.each([
      {
        ...commonFields,
        subject: 'Test Subject',
        templateType: TemplateType.EMAIL,
      },
      {
        ...commonFields,
        templateType: TemplateType.SMS,
      },
      {
        ...commonFields,
        templateType: TemplateType.NHS_APP,
      },
    ])('should pass validation %p', async (template) => {
      const result = $CreateTemplateSchema.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });

  describe('$UpdateTemplateSchema', () => {
    const commonFields = {
      name: 'Test Template',
      message: 'This is a test template',
      templateStatus: TemplateStatus.SUBMITTED,
    };

    test.each([
      {
        ...commonFields,
        subject: 'Test Subject',
        templateType: TemplateType.EMAIL,
      },
      {
        ...commonFields,
        templateType: TemplateType.SMS,
      },
      {
        ...commonFields,
        templateType: TemplateType.NHS_APP,
      },
    ])('should pass validation %p', async (template) => {
      const result = $UpdateTemplateSchema.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });
});
