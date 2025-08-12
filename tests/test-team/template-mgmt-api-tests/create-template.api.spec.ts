import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  isoDateRegExp,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { testClients } from '../helpers/client/client-helper';

test.describe('POST /v1/template', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let userNoClient: TestUser;
  let userDirectOwner: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userNoClient = await authHelper.getTestUser(testUsers.User6.userId);
    userDirectOwner = await authHelper.getTestUser(testUsers.User7.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
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
        templateType: 'Invalid input',
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
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'INVALID',
        }),
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        templateType: 'Invalid input',
      },
    });
  });

  test('returns 400 if the template is a letter', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'LETTER',
          letterType: 'x0',
          language: 'en',
        }),
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        templateType: 'Invalid input',
      },
    });
  });

  test.describe('NHS_APP templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'NHS_APP',
      });

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

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.owner,
        clientOwned: user1.clientOwner,
      });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          clientId: user1.clientId,
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

    test('ignores template status if given - template cannot be submitted at create time', async ({
      request,
    }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
            templateStatus: 'SUBMITTED',
          }),
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.owner,
        clientOwned: user1.clientOwner,
      });

      expect(created.template.templateStatus).toEqual('NOT_YET_SUBMITTED');
    });

    test('returns 400 if template has no name', async ({ request }) => {
      const { name: _, ...data } =
        TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Invalid input: expected string, received undefined',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
            name: '',
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Too small: expected string to have >=1 characters',
        },
      });
    });

    test('returns 400 if template has no message', async ({ request }) => {
      const { message: _, ...data } =
        TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Invalid input: expected string, received undefined',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
            message: '',
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Too small: expected string to have >=1 characters',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
            message: 'x'.repeat(5001),
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Too big: expected string to have <=5000 characters',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
            message: '<>',
          }),
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
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'SMS',
      });

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

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.owner,
        clientOwned: user1.clientOwner,
      });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          clientId: user1.clientId,
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

    test('ignores template status if given - template cannot be submitted at create time', async ({
      request,
    }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
            templateStatus: 'SUBMITTED',
          }),
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.owner,
        clientOwned: user1.clientOwner,
      });

      expect(created.template.templateStatus).toEqual('NOT_YET_SUBMITTED');
    });

    test('returns 400 if template has no name', async ({ request }) => {
      const { name: _, ...data } =
        TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'SMS',
        });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Invalid input: expected string, received undefined',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
            name: '',
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Too small: expected string to have >=1 characters',
        },
      });
    });

    test('returns 400 if template has no message', async ({ request }) => {
      const { message: _, ...data } =
        TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'SMS',
        });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Invalid input: expected string, received undefined',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
            message: '',
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Too small: expected string to have >=1 characters',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
            message: 'x'.repeat(919),
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Too big: expected string to have <=918 characters',
        },
      });
    });
  });

  test.describe('EMAIL templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'EMAIL',
      });

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

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.owner,
        clientOwned: user1.clientOwner,
      });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          clientId: user1.clientId,
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

    test('ignores template status if given - template cannot be submitted at create time', async ({
      request,
    }) => {
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
            templateStatus: 'SUBMITTED',
          }),
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.owner,
        clientOwned: user1.clientOwner,
      });

      expect(created.template.templateStatus).toEqual('NOT_YET_SUBMITTED');
    });

    test('returns 400 if template has no name', async ({ request }) => {
      const { name: _, ...data } =
        TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'EMAIL',
        });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Invalid input: expected string, received undefined',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
            name: '',
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          name: 'Too small: expected string to have >=1 characters',
        },
      });
    });

    test('returns 400 if template has no subject', async ({ request }) => {
      const { subject: _, ...data } =
        TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'EMAIL',
        });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          subject: 'Invalid input: expected string, received undefined',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
            subject: '',
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          subject: 'Too small: expected string to have >=1 characters',
        },
      });
    });

    test('returns 400 if template has no message', async ({ request }) => {
      const { message: _, ...data } =
        TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'EMAIL',
        });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Invalid input: expected string, received undefined',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
            message: '',
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Too small: expected string to have >=1 characters',
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
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
            message: 'x'.repeat(100_001),
          }),
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          message: 'Too big: expected string to have <=100000 characters',
        },
      });
    });
  });

  test.describe('user-owned templates', () => {
    test('user without a clientId assigned can create a template', async ({
      request,
    }) => {
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'NHS_APP',
      });

      const start = new Date();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await userNoClient.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: userNoClient.userId,
        clientOwned: userNoClient.clientOwner,
      });

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

    test('can create a user-owned template', async ({ request }) => {
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'NHS_APP',
      });

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await userDirectOwner.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: userDirectOwner.owner,
        clientOwned: userDirectOwner.clientOwner,
      });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          campaignId: testClients[userDirectOwner.clientKey]?.campaignId,
          clientId: userDirectOwner.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          name: template.name,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });
    });
  });
});
