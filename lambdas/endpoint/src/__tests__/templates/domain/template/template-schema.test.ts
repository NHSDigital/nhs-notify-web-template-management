import {
  CreateTemplateInput,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-templates-client';
import { validate } from '../../../../utils/validate';
import {
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
} from '../../../../templates/domain/template';

describe('templateSchema - $CreateTemplateSchema', () => {
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

  test('should fail validation, when no subject line for EMAIL', () => {
    const template: CreateTemplateInput = {
      name: 'Test Template',
      message: 'This is a test template',
      type: TemplateType.EMAIL,
    };

    const result = validate($CreateTemplateSchema, template);

    expect(result).toEqual({
      error: {
        code: 400,
        message: 'Request failed validation',
        actualError: {
          fieldErrors: {
            subject: ['Required'],
          },
          formErrors: [],
        },
      },
    });
  });
});

describe('templateSchema - $UpdateTemplateSchema', () => {
  const commonFields = {
    id: 'id',
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
