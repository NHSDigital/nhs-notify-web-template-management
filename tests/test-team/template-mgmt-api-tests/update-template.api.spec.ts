import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  isoDateRegExp,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import { testClients } from '../helpers/client/client-helper';

test.describe('POST /v1/template/:templateId', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let user2: TestUser;
  let userDirectOwner: TestUser;
  let userSharedClient: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    user2 = await authHelper.getTestUser(testUsers.User2.userId);
    userDirectOwner = await authHelper.getTestUser(testUsers.User8.userId);
    userSharedClient = await authHelper.getTestUser(testUsers.User9.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template/some-template`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if template does not exist', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template/noexist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 404 if template exists but is owned by a different user', async ({
    request,
  }) => {
    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    templateStorageHelper.addAdHocTemplateKey({
      id: created.template.id,
      owner: user1.owner,
    });

    const updateResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );

    expect(updateResponse.status()).toBe(404);
    expect(await updateResponse.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 400 if no body on request', async ({ request }) => {
    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    templateStorageHelper.addAdHocTemplateKey({
      id: created.template.id,
      owner: user1.userId,
    });

    const updateResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(400);
    expect(await updateResponse.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        templateType: 'Invalid input',
      },
    });
  });

  test('returns 400 if template type is invalid', async ({ request }) => {
    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    templateStorageHelper.addAdHocTemplateKey({
      id: created.template.id,
      owner: user1.userId,
    });

    const updateResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'INVALID',
        }),
      }
    );

    expect(updateResponse.status()).toBe(400);
    expect(await updateResponse.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        templateType: 'Invalid input',
      },
    });
  });

  test('returns 400 when attempting to update a letter', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileName: 'template.pdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.noCustomPersonalisation.pdf.open(),
          },
        ]
      );

    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user1.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    templateStorageHelper.addAdHocTemplateKey({
      id: created.template.id,
      owner: user1.userId,
    });

    const updateResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'LETTER',
          language: 'en',
          letterType: 'x0',
          templateStatus: 'SUBMITTED',
        }),
      }
    );

    expect(updateResponse.status()).toBe(400);
    expect(await updateResponse.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        templateType: 'Invalid input',
      },
    });
  });

  test.describe('NHS_APP templates', () => {
    test('returns 200 and the updated template data', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateData = TemplateAPIPayloadFactory.getUpdateTemplatePayload({
        templateType: 'NHS_APP',
      });

      const start = new Date();

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: updateData.message,
          name: updateData.name,
          templateStatus: updateData.templateStatus,
          templateType: updateData.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(created.template.createdAt);
    });

    test('returns 400 if changing the template type', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateSMSResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(updateSMSResponse.status()).toBe(400);

      const updateSMSResponseBody = await updateSMSResponse.json();

      expect(updateSMSResponseBody).toEqual({
        details: {
          templateType: 'Expected NHS_APP but got SMS',
        },
        statusCode: 400,
        technicalMessage: 'Can not change template templateType',
      });

      const updateEmailResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(updateEmailResponse.status()).toBe(400);

      const updateEmailResponseBody = await updateEmailResponse.json();

      expect(updateEmailResponseBody).toEqual({
        details: {
          templateType: 'Expected NHS_APP but got EMAIL',
        },
        statusCode: 400,
        technicalMessage: 'Can not change template templateType',
      });
    });

    test('returns 400 - cannot update attributes on a submitted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
            templateStatus: 'SUBMITTED',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 400 - cannot change status on a submitted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const submitData = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'NHS_APP',
        templateStatus: 'SUBMITTED',
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            ...submitData,
            templateStatus: 'NOT_YET_SUBMITTED',
          },
        }
      );

      expect(updateResponse.status()).toBe(400);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });
    test('returns 404 - cannot update a deleted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
            templateStatus: 'DELETED',
          }),
        }
      );

      expect(updateResponse.status()).toBe(404);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });

    test('returns 400 if missing template name', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const { name: _, ...updateData } =
        TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'NHS_APP',
        });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          name: 'Invalid input: expected string, received undefined',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if template name is empty', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
            name: '',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          name: 'Too small: expected string to have >=1 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });

    test('returns 400 if missing template message', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const { message: _, ...updateData } =
        TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'NHS_APP',
        });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Invalid input: expected string, received undefined',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if template message is empty', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
            message: '',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Too small: expected string to have >=1 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });

    test('returns 400 if template message is over 5000 characters', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
            message: 'x'.repeat(5001),
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Too big: expected string to have <=5000 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });

    test('returns 400 if template message has disallowed characters', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
            message: '<>',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message:
            'Message contains disallowed characters. Disallowed characters: <(.|\n)*?>',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
  });

  test.describe('SMS templates', () => {
    test('returns 200 and the updated template data', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateData = TemplateAPIPayloadFactory.getUpdateTemplatePayload({
        templateType: 'SMS',
      });

      const start = new Date();

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: updateData.message,
          name: updateData.name,
          templateStatus: updateData.templateStatus,
          templateType: updateData.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(created.template.createdAt);
    });

    test('returns 400 if changing the template type', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateNHSAppResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(updateNHSAppResponse.status()).toBe(400);

      const updateNHSAppResponseBody = await updateNHSAppResponse.json();

      expect(updateNHSAppResponseBody).toEqual({
        details: {
          templateType: 'Expected SMS but got NHS_APP',
        },
        statusCode: 400,
        technicalMessage: 'Can not change template templateType',
      });

      const updateEmailResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(updateEmailResponse.status()).toBe(400);

      const updateEmailResponseBody = await updateEmailResponse.json();

      expect(updateEmailResponseBody).toEqual({
        details: {
          templateType: 'Expected SMS but got EMAIL',
        },
        statusCode: 400,
        technicalMessage: 'Can not change template templateType',
      });
    });

    test('returns 400 - cannot update attributes on a submitted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'SMS',
            templateStatus: 'SUBMITTED',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 400 - cannot change status on a submitted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const submitData = TemplateAPIPayloadFactory.getUpdateTemplatePayload({
        templateType: 'SMS',
        templateStatus: 'SUBMITTED',
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            ...submitData,
            templateStatus: 'NOT_YET_SUBMITTED',
          },
        }
      );

      expect(updateResponse.status()).toBe(400);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });
    test('returns 400 - cannot update a deleted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'SMS',
            templateStatus: 'DELETED',
          }),
        }
      );

      expect(updateResponse.status()).toBe(404);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });

    test('returns 400 if missing template name', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const { name: _, ...updateData } =
        TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'SMS',
        });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          name: 'Invalid input: expected string, received undefined',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if template name is empty', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'SMS',
            name: '',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          name: 'Too small: expected string to have >=1 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });

    test('returns 400 if missing template message', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const { message: _, ...updateData } =
        TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'SMS',
        });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Invalid input: expected string, received undefined',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if template message is empty', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'SMS',
            message: '',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Too small: expected string to have >=1 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });

    test('returns 400 if template message is over 918 characters', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'SMS',
            message: 'x'.repeat(919),
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Too big: expected string to have <=918 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
  });

  test.describe('EMAIL templates', () => {
    test('returns 200 and the updated template data', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateData = TemplateAPIPayloadFactory.getUpdateTemplatePayload({
        templateType: 'EMAIL',
      });

      const start = new Date();

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: updateData.message,
          name: updateData.name,
          subject: updateData.subject,
          templateStatus: updateData.templateStatus,
          templateType: updateData.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(created.template.createdAt);
    });

    test('returns 400 if changing the template type', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateNHSAppResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'NHS_APP',
          }),
        }
      );

      expect(updateNHSAppResponse.status()).toBe(400);

      const updateNHSAppResponseBody = await updateNHSAppResponse.json();

      expect(updateNHSAppResponseBody).toEqual({
        details: {
          templateType: 'Expected EMAIL but got NHS_APP',
        },
        statusCode: 400,
        technicalMessage: 'Can not change template templateType',
      });

      const updateSMSResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'SMS',
          }),
        }
      );

      expect(updateSMSResponse.status()).toBe(400);

      const updateSMSResponseBody = await updateSMSResponse.json();

      expect(updateSMSResponseBody).toEqual({
        details: {
          templateType: 'Expected EMAIL but got SMS',
        },
        statusCode: 400,
        technicalMessage: 'Can not change template templateType',
      });
    });

    test('returns 400 - cannot update attributes on a submitted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
            templateStatus: 'SUBMITTED',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 400 - cannot change status on a submitted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const submitData = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'EMAIL',
        templateStatus: 'SUBMITTED',
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: {
            ...submitData,
            templateStatus: 'NOT_YET_SUBMITTED',
          },
        }
      );

      expect(updateResponse.status()).toBe(400);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 400 - cannot update a deleted template', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
            templateStatus: 'DELETED',
          }),
        }
      );

      expect(updateResponse.status()).toBe(404);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });

    test('returns 400 if missing template name', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const { name: _, ...updateData } =
        TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'EMAIL',
        });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          name: 'Invalid input: expected string, received undefined',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if template name is empty', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
            name: '',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          name: 'Too small: expected string to have >=1 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });

    test('returns 400 if missing template subject', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const { subject: _, ...updateData } =
        TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'EMAIL',
        });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          subject: 'Invalid input: expected string, received undefined',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if template subject is empty', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
            subject: '',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          subject: 'Too small: expected string to have >=1 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if missing template message', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const { message: _, ...updateData } =
        TemplateAPIPayloadFactory.getUpdateTemplatePayload({
          templateType: 'EMAIL',
        });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Invalid input: expected string, received undefined',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
    test('returns 400 if template message is empty', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
            message: '',
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Too small: expected string to have >=1 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });

    test('returns 400 if template message is over 100_000 characters', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
            templateType: 'EMAIL',
            message: 'x'.repeat(100_001),
          }),
        }
      );

      expect(updateResponse.status()).toBe(400);

      expect(await updateResponse.json()).toEqual({
        details: {
          message: 'Too big: expected string to have <=100000 characters',
        },
        statusCode: 400,
        technicalMessage: 'Request failed validation',
      });
    });
  });

  test.describe('shared ownership', () => {
    test('user belonging to the same client as the creator can update', async ({
      request,
    }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      const updateData = TemplateAPIPayloadFactory.getUpdateTemplatePayload({
        templateType: 'EMAIL',
      });

      const start = new Date();

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await userSharedClient.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(user1.clientId).toBe(userSharedClient.clientId);

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: updateData.message,
          name: updateData.name,
          subject: updateData.subject,
          templateStatus: updateData.templateStatus,
          templateType: updateData.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(created.template.createdAt);
    });
  });

  test.describe('user-owned templates', () => {
    test('user-owner can update', async ({ request }) => {
      const createResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await userDirectOwner.getAccessToken(),
          },
          data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
            templateType: 'EMAIL',
          }),
        }
      );

      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: userDirectOwner.userId,
      });

      const updateData = TemplateAPIPayloadFactory.getUpdateTemplatePayload({
        templateType: 'EMAIL',
      });

      const updateResponse = await request.post(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await userDirectOwner.getAccessToken(),
          },
          data: updateData,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          campaignId: testClients[userDirectOwner.clientKey]?.campaignId,
          clientId: userDirectOwner.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: updateData.message,
          name: updateData.name,
          subject: updateData.subject,
          templateStatus: updateData.templateStatus,
          templateType: updateData.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });
    });
  });
});
