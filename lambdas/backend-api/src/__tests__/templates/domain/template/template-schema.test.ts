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
  test('$LetterTemplate - should pass validation', () => {
    const result = validate($LetterTemplate, {
      name: 'Test Template',
      message: 'This is a test template',
      type: TemplateType.LETTER,
    });

    expect(result).toEqual({
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        type: TemplateType.LETTER,
      },
    });
  });

  test('$LetterTemplate - should fail validation, when max character length exceeded', () => {
    const result = validate($LetterTemplate, {
      name: 'Test Template',
      message: 'a'.repeat(15_001),
      type: TemplateType.LETTER,
    });

    expect(result).toEqual({
      error: {
        code: 400,
        message: `Request failed validation`,
        actualError: {
          fieldErrors: {
            message: [`String must contain at most 15000 character(s)`],
          },
          formErrors: [],
        },
      },
    });
  });

  test('$SMSTemplate - should pass validation', () => {
    const result = validate($SMSTemplate, {
      name: 'Test Template',
      message: 'This is a test template',
      type: TemplateType.SMS,
    });

    expect(result).toEqual({
      data: {
        name: 'Test Template',
        message: 'This is a test template',
        type: TemplateType.SMS,
      },
    });
  });

  test('$SMSTemplate - should fail validation, when max character length exceeded', () => {
    const result = validate($SMSTemplate, {
      name: 'Test Template',
      message: 'a'.repeat(919),
      type: TemplateType.SMS,
    });

    expect(result).toEqual({
      error: {
        code: 400,
        message: `Request failed validation`,
        actualError: {
          fieldErrors: {
            message: [`String must contain at most 918 character(s)`],
          },
          formErrors: [],
        },
      },
    });
  });

  test('$EmailTemplate - should pass validation', () => {
    const result = validate($EmailTemplate, {
      name: 'Test Template',
      message: 'This is a test template',
      subject: 'Test Subject',
      type: TemplateType.EMAIL,
    });

    expect(result).toEqual({
      data: {
        name: 'Test Template',
        subject: 'Test Subject',
        message: 'This is a test template',
        type: TemplateType.EMAIL,
      },
    });
  });

  test('$EmailTemplate - should fail validation, when max character length exceeded', () => {
    const result = validate($EmailTemplate, {
      name: 'Test Template',
      message: 'a'.repeat(100_001),
      subject: 'Test Subject',
      type: TemplateType.EMAIL,
    });

    expect(result).toEqual({
      error: {
        code: 400,
        message: `Request failed validation`,
        actualError: {
          fieldErrors: {
            message: [`String must contain at most 100000 character(s)`],
          },
          formErrors: [],
        },
      },
    });
  });

  test('$EmailTemplate - should fail validation, when no subject', () => {
    const result = validate($EmailTemplate, {
      name: 'Test Template',
      message: 'a'.repeat(100_000),
      type: TemplateType.EMAIL,
    });

    expect(result).toEqual({
      error: {
        code: 400,
        message: `Request failed validation`,
        actualError: {
          fieldErrors: {
            subject: [`Required`],
          },
          formErrors: [],
        },
      },
    });
  });

  test('$NhsAppTemplate - should pass validation', () => {
    const result = validate($NhsAppTemplate, {
      name: 'Test Template',
      message: '\n hello world!!',
      type: TemplateType.NHS_APP,
    });

    expect(result).toEqual({
      data: {
        name: 'Test Template',
        message: '\n hello world!!',
        type: TemplateType.NHS_APP,
      },
    });
  });

  test('$NhsAppTemplate - should fail validation, when max character length exceeded', () => {
    const result = validate($NhsAppTemplate, {
      name: 'Test Template',
      message: 'a'.repeat(5001),
      type: TemplateType.NHS_APP,
      status: TemplateStatus.SUBMITTED,
    });

    expect(result).toEqual({
      error: {
        code: 400,
        message: `Request failed validation`,
        actualError: {
          fieldErrors: {
            message: [`String must contain at most 5000 character(s)`],
          },
          formErrors: [],
        },
      },
    });
  });

  test.each([
    '<element>failed</element>',
    '<element><nested>nested</nested></element>',
    '<element attribute="failed">failed</element>',
  ])(
    '$NhsAppTemplate - should fail validation, when invalid characters are present %p',
    (message) => {
      const result = validate($NhsAppTemplate, {
        name: 'Test Template',
        message,
        type: TemplateType.NHS_APP,
      });

      expect(result).toEqual({
        error: {
          code: 400,
          message: `Request failed validation`,
          actualError: {
            fieldErrors: {
              message: [
                String.raw`NHS App template message contains disallowed characters. Disallowed characters: /<(.|\n)*?>/gi`,
              ],
            },
            formErrors: [],
          },
        },
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
        type: TemplateType.EMAIL,
      },
      {
        ...commonFields,
        type: TemplateType.LETTER,
      },
      {
        ...commonFields,
        type: TemplateType.SMS,
      },
      {
        ...commonFields,
        type: TemplateType.NHS_APP,
      },
    ])('should pass validation %p', (template) => {
      const result = validate($CreateTemplateSchema, template);

      expect(result).toEqual({
        data: template,
      });
    });
  });

  describe('$UpdateTemplateSchema', () => {
    const commonFields = {
      name: 'Test Template',
      message: 'This is a test template',
      status: TemplateStatus.SUBMITTED,
    };

    test.each([
      {
        ...commonFields,
        subject: 'Test Subject',
        type: TemplateType.EMAIL,
      },
      {
        ...commonFields,
        type: TemplateType.LETTER,
      },
      {
        ...commonFields,
        type: TemplateType.SMS,
      },
      {
        ...commonFields,
        type: TemplateType.NHS_APP,
      },
    ])('should pass validation %p', (template) => {
      const result = validate($UpdateTemplateSchema, template);

      expect(result).toEqual({
        data: template,
      });
    });
  });
});
