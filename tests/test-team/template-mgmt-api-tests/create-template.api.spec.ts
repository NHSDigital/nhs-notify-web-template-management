import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import { isoDateRegExp, uuidRegExp } from '../helpers/rexexp';

test.describe('POST /v1/template', async () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const createdTemplates: { owner: string; id: string }[] = [];
  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(TestUserId.User1);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplates(createdTemplates);
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 400 if no body on request', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        templateType:
          "Invalid discriminator value. Expected 'SMS' | 'NHS_APP' | 'EMAIL'",
      },
    });
  });

  test('returns 400 if template has invalid template type', async ({
    request,
  }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: {
          templateType: 'INVALID',
          name: 'example-name',
          message: 'example-message',
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        templateType:
          "Invalid discriminator value. Expected 'SMS' | 'NHS_APP' | 'EMAIL'",
      },
    });
  });

  test.describe('NHS_APP templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = {
        templateType: 'NHS_APP',
        name: faker.word.noun(),
        message: faker.word.words(5),
      };

      const start = new Date();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      createdTemplates.push({ id: created.template.id, owner: user1.email });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          name: template.name,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(created.template.createdAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(created.template.createdAt).toEqual(created.template.updatedAt);
    });

    test('ignores template status if given - template not submitted', async ({
      request,
    }) => {
      const template = {
        templateType: 'NHS_APP',
        name: faker.word.noun(),
        message: faker.word.words(5),
        templateStatus: 'SUBMITTED',
      };

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      createdTemplates.push({ id: created.template.id, owner: user1.email });

      expect(created.template.templateStatus).toEqual('NOT_YET_SUBMITTED');
    });

    test('returns 400 if template has no name', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'NHS_APP',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Required',
        },
      });
    });

    test('returns 400 if template has empty name', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'NHS_APP',
            name: '',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'String must contain at least 1 character(s)',
        },
      });
    });

    test('returns 400 if template has no message', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'NHS_APP',
            name: 'example-name',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Required',
        },
      });
    });

    test('returns 400 if template has empty message', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'NHS_APP',
            name: 'example-name',
            message: '',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'String must contain at least 1 character(s)',
        },
      });
    });

    test('returns 400 if template has message over 5000 characters', async ({
      request,
    }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'NHS_APP',
            name: 'example-name',
            message: 'x'.repeat(5001),
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'String must contain at most 5000 character(s)',
        },
      });
    });

    test('returns 400 if template has message disallowed characters', async ({
      request,
    }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'NHS_APP',
            name: 'example-name',
            message: '<>',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message:
            'Message contains disallowed characters. Disallowed characters: <(.|\n)*?>',
        },
      });
    });
  });

  test.describe('SMS templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = {
        templateType: 'SMS',
        name: faker.word.noun(),
        message: faker.word.words(5),
      };

      const start = new Date();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      createdTemplates.push({ id: created.template.id, owner: user1.email });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          name: template.name,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(created.template.createdAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(created.template.createdAt).toEqual(created.template.updatedAt);
    });

    test('ignores template status if given - template not submitted', async ({
      request,
    }) => {
      const template = {
        templateType: 'SMS',
        name: faker.word.noun(),
        message: faker.word.words(5),
        templateStatus: 'SUBMITTED',
      };

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      createdTemplates.push({ id: created.template.id, owner: user1.email });

      expect(created.template.templateStatus).toEqual('NOT_YET_SUBMITTED');
    });

    test('returns 400 if template has no name', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'SMS',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Required',
        },
      });
    });

    test('returns 400 if template has empty name', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'SMS',
            name: '',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'String must contain at least 1 character(s)',
        },
      });
    });

    test('returns 400 if template has no message', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'SMS',
            name: 'example-name',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Required',
        },
      });
    });

    test('returns 400 if template has empty message', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'SMS',
            name: 'example-name',
            message: '',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'String must contain at least 1 character(s)',
        },
      });
    });

    test('returns 400 if template has message over 918 characters', async ({
      request,
    }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'SMS',
            name: 'example-name',
            message: 'x'.repeat(919),
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'String must contain at most 918 character(s)',
        },
      });
    });
  });

  test.describe('EMAIL templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = {
        templateType: 'EMAIL',
        name: faker.word.noun(),
        subject: faker.word.interjection(),
        message: faker.word.words(5),
      };

      const start = new Date();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      createdTemplates.push({ id: created.template.id, owner: user1.email });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          name: template.name,
          subject: template.subject,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(created.template.createdAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(created.template.createdAt).toEqual(created.template.updatedAt);
    });

    test('ignores template status if given - template not submitted', async ({
      request,
    }) => {
      const template = {
        templateType: 'EMAIL',
        name: faker.word.noun(),
        subject: faker.word.interjection(),
        message: faker.word.words(5),
        templateStatus: 'SUBMITTED',
      };

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      createdTemplates.push({ id: created.template.id, owner: user1.email });

      expect(created.template.templateStatus).toEqual('NOT_YET_SUBMITTED');
    });

    test('returns 400 if template has no name', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'EMAIL',
            subject: 'example-subject',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Required',
        },
      });
    });

    test('returns 400 if template has empty name', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'EMAIL',
            name: '',
            subject: 'example-subject',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'String must contain at least 1 character(s)',
        },
      });
    });

    test('returns 400 if template has no subject', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'EMAIL',
            name: 'example-name',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          subject: 'Required',
        },
      });
    });

    test('returns 400 if template has empty subject', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'EMAIL',
            name: 'example-name',
            subject: '',
            message: 'example-message',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          subject: 'String must contain at least 1 character(s)',
        },
      });
    });

    test('returns 400 if template has no message', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'EMAIL',
            name: 'example-name',
            subject: 'example-subject',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Required',
        },
      });
    });

    test('returns 400 if template has empty message', async ({ request }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'EMAIL',
            name: 'example-name',
            subject: 'example-subject',
            message: '',
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'String must contain at least 1 character(s)',
        },
      });
    });

    test('returns 400 if template has message over 100_000 characters', async ({
      request,
    }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            templateType: 'EMAIL',
            name: 'example-name',
            subject: 'example-subject',
            message: 'x'.repeat(100_001),
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'String must contain at most 100000 character(s)',
        },
      });
    });
  });
});
