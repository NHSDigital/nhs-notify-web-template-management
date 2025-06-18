import {
  $CreateLetterProperties,
  $CreateUpdateNonLetter,
  $CreateUpdateTemplate,
  isCreateUpdateTemplateValid,
  isTemplateDtoValid,
} from '../../schemas';
import type { CreateUpdateTemplate, TemplateDto } from '../../types/generated';

describe('Template schemas', () => {
  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        clientId: 'client1',
        userId: 'user1',
        message: 'a'.repeat(100_001),
        subject: 'Test Subject',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        clientId: 'client1',
        userId: 'user1',
        message: 'a'.repeat(919),
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'Test Template',
        clientId: 'client1',
        userId: 'user1',
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
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        clientId: 'client1',
        userId: 'user1',
        message: ' ',
        subject: ' ',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        clientId: 'client1',
        userId: 'user1',
        message: ' ',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        clientId: 'client1',
        userId: 'user1',
        message: ' ',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: ' ',
        clientId: 'client1',
        userId: 'user1',
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '%p.templateType - should fail validation, when name, message or subject is whitespace',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'String must contain at least 1 character(s)';

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
        clientId: 'client1',
        userId: 'user1',
        message: '',
        subject: '',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        clientId: 'client1',
        userId: 'user1',
        message: '',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        clientId: 'client1',
        userId: 'user1',
        message: '',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: '',
        clientId: 'client1',
        userId: 'user1',
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '%p - should fail validation, when name, message or subject is empty',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);
      const errorMessage = 'String must contain at least 1 character(s)';

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

  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'email',
        userId: 'user1',
        message: 'message',
        subject: 'subject',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'text',
        userId: 'user1',
        message: 'message',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'app',
        userId: 'user1',
        message: 'message',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'letter',
        userId: 'user1',
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '%p - should fail validation, when there is no client ID',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            clientId: ['Required'],
          },
        })
      );
    }
  );

  test.each([
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'email',
        clientId: 'client1',
        message: 'message',
        subject: 'subject',
        templateType: 'EMAIL',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'text',
        clientId: 'client1',
        message: 'message',
        templateType: 'SMS',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'app',
        clientId: 'client1',
        message: 'message',
        templateType: 'NHS_APP',
      },
    },
    {
      schema: $CreateUpdateTemplate,
      data: {
        name: 'letter',
        clientId: 'client1',
        templateType: 'LETTER',
        letterType: 'x0',
        language: 'en',
      },
    },
  ])(
    '%p - should fail validation, when there is no user ID',
    async ({ schema, data }) => {
      const result = schema.safeParse(data);

      expect(result.error?.flatten()).toEqual(
        expect.objectContaining({
          fieldErrors: {
            userId: ['Required'],
          },
        })
      );
    }
  );

  test('$CreateUpdateNonLetter should fail when input is a letter', () => {
    const letter: CreateUpdateTemplate = {
      templateType: 'LETTER',
      letterType: 'x1',
      language: 'ar',
      name: 'letter',
      clientId: 'client1',
      userId: 'user1',
    };

    const result = $CreateUpdateNonLetter.safeParse(letter);

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          templateType: [
            "Invalid discriminator value. Expected 'NHS_APP' | 'EMAIL' | 'SMS'",
          ],
        },
      })
    );
  });

  test('Email template fields - should fail validation, when no subject', async () => {
    const result = $CreateUpdateTemplate.safeParse({
      name: 'Test Template',
      clientId: 'client1',
      userId: 'user1',
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

  test('Letter template fields - should fail validation, when no letterType', async () => {
    const result = $CreateLetterProperties.safeParse({
      name: 'Test Template',
      clientId: 'client1',
      userId: 'user1',
      templateType: 'LETTER',
      language: 'en',
    });

    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          letterType: ['Required'],
        },
      })
    );
  });

  test.each([
    '<element>failed</element>',
    '<element><nested>nested</nested></element>',
    '<element attribute="failed">failed</element>',
  ])(
    'App template fields - should fail validation, when invalid characters are present %p',
    async (message) => {
      const result = $CreateUpdateTemplate.safeParse({
        name: 'Test Template',
        clientId: 'client1',
        userId: 'user1',
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

  describe('$CreateUpdateTemplate', () => {
    const commonFields = {
      name: 'Test Template',
      clientId: 'client1',
      userId: 'user1',
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
      },
    ])('should pass validation %p', async (template) => {
      const result = $CreateUpdateTemplate.safeParse(template);

      expect(result.data).toEqual(template);
    });
  });

  describe('isCreateUpdateTemplateValid', () => {
    const template: CreateUpdateTemplate = {
      name: 'Test Template',
      clientId: 'client1',
      userId: 'user1',
      message: 'This is a test template',
      templateType: 'NHS_APP',
    };

    test('Should return template on pass', async () => {
      const result = isCreateUpdateTemplateValid(template);

      expect(result).toEqual(template);
    });

    test('Should return undefined on fail', async () => {
      const result = isCreateUpdateTemplateValid({
        ...template,
        name: undefined,
      });

      expect(result).toEqual(undefined);
    });
  });

  describe('isTemplateDtoValid', () => {
    const template: TemplateDto = {
      name: 'Test Template',
      clientId: 'client1',
      userId: 'user1',
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
