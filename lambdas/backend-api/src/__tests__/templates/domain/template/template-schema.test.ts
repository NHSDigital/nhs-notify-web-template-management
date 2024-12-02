import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';
import { validate } from '@backend-api/utils/validate';
import {
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
  $LetterTemplate,
  $EmailTemplate,
  $SMSTemplate,
  $NhsAppTemplate,
} from '@backend-api/templates/domain/template/template-schema';

describe('Template schemas', () => {
  test.each([
    {
      schema: $LetterTemplate,
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        templateType: TemplateType.LETTER,
      },
    },
    {
      schema: $EmailTemplate,
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        subject: 'Test Subject',
        templateType: TemplateType.EMAIL,
      },
    },
    {
      schema: $SMSTemplate,
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        templateType: TemplateType.SMS,
      },
    },
    {
      schema: $NhsAppTemplate,
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        templateType: TemplateType.NHS_APP,
      },
    },
  ])('%p.templateType - should pass validation', async ({ schema, data }) => {
    const result = await validate(schema, data);

    expect(result).toEqual({
      data,
    });
  });

  test.each([
    {
      schema: $LetterTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(15_001),
        templateType: TemplateType.LETTER,
      },
    },
    {
      schema: $EmailTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(100_001),
        subject: 'Test Subject',
        templateType: TemplateType.EMAIL,
      },
    },
    {
      schema: $SMSTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(919),
        templateType: TemplateType.SMS,
      },
    },
    {
      schema: $NhsAppTemplate,
      data: {
        name: 'Test Template',
        message: 'a'.repeat(5001),
        templateType: TemplateType.NHS_APP,
      },
    },
  ])(
    '%p.templateType - should fail validation, when max character length exceeded',
    async ({ schema, data }) => {
      const result = await validate(schema, data);

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: `Request failed validation`,
          details: {
            message: `String must contain at most ${data.message.length - 1} character(s)`,
          },
        }),
      });
    }
  );

  test('$EmailTemplate - should fail validation, when no subject', async () => {
    const result = await validate($EmailTemplate, {
      name: 'Test Template',
      message: 'a'.repeat(100_000),
      templateType: TemplateType.EMAIL,
    });

    expect(result).toEqual({
      error: expect.objectContaining({
        code: 400,
        message: `Request failed validation`,
        details: {
          subject: `Required`,
        },
      }),
    });
  });

  test.each([
    '<element>failed</element>',
    '<element><nested>nested</nested></element>',
    '<element attribute="failed">failed</element>',
  ])(
    '$NhsAppTemplate - should fail validation, when invalid characters are present %p',
    async (message) => {
      const result = await validate($NhsAppTemplate, {
        name: 'Test Template',
        message,
        templateType: TemplateType.NHS_APP,
      });

      expect(result).toEqual({
        error: expect.objectContaining({
          code: 400,
          message: `Request failed validation`,
          details: {
            message: String.raw`NHS App template message contains disallowed characters. Disallowed characters: /<(.|\n)*?>/gi`,
          },
        }),
      });
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
        templateType: TemplateType.LETTER,
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
      const result = await validate($CreateTemplateSchema, template);

      expect(result).toEqual({
        data: template,
      });
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
        templateType: TemplateType.LETTER,
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
      const result = await validate($UpdateTemplateSchema, template);

      expect(result).toEqual({
        data: template,
      });
    });
  });
});
