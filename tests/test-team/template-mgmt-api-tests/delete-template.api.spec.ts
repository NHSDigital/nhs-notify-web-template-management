import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import {
  UseCaseOrchestrator,
  SimulatePassedValidation,
} from '../helpers/use-cases';

test.describe('DELETE /v1/template/:templateId', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const orchestrator = new UseCaseOrchestrator();
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    user2 = await authHelper.getTestUser(testUsers.User2.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/some-template`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if template does not exist', async ({ request }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/noexist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
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
      owner: user1.userId,
    });

    const updateResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(404);
    expect(await updateResponse.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test.describe('LETTER templates', () => {
    test('returns 204', async ({ request }) => {
      const { multipart, contentType } =
        TemplateAPIPayloadFactory.getCreateLetterTemplatePayload(
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
              file: pdfUploadFixtures.withPersonalisation.pdf.open(),
            },
            {
              _type: 'file',
              partName: 'testCsv',
              fileName: 'test-data.csv',
              fileType: 'text/csv',
              file: pdfUploadFixtures.withPersonalisation.csv.open(),
            },
          ]
        );

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/letter-template`,
        {
          data: multipart,
          headers: {
            Authorization: await user1.getAccessToken(),
            'Content-Type': contentType,
          },
        }
      );

      const createResult = await response.json();

      const debug = JSON.stringify(createResult, null, 2);

      templateStorageHelper.addAdHocTemplateKey({
        id: createResult.template.id,
        owner: user1.userId,
      });

      expect(response.status(), debug).toBe(201);

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);
    });

    test('returns 400 - cannot delete a submitted template', async ({
      request,
    }) => {
      const { multipart, contentType } =
        TemplateAPIPayloadFactory.getCreateLetterTemplatePayload(
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
              file: pdfUploadFixtures.withPersonalisation.pdf.open(),
            },
            {
              _type: 'file',
              partName: 'testCsv',
              fileName: 'test-data.csv',
              fileType: 'text/csv',
              file: pdfUploadFixtures.withPersonalisation.csv.open(),
            },
          ]
        );

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/letter-template`,
        {
          data: multipart,
          headers: {
            Authorization: await user1.getAccessToken(),
            'Content-Type': contentType,
          },
        }
      );

      const createResult = await response.json();

      const debug = JSON.stringify(createResult, null, 2);

      templateStorageHelper.addAdHocTemplateKey({
        id: createResult.template.id,
        owner: user1.userId,
      });

      expect(response.status(), debug).toBe(201);

      await orchestrator.send(
        new SimulatePassedValidation({
          templateId: createResult.template.id,
          templateOwner: user1.userId,
          hasTestData: true,
        })
      );

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      const submitResult = await submitResponse.json();

      expect(
        submitResponse.status(),
        JSON.stringify(submitResult, null, 2)
      ).toBe(200);

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(400);

      const failedSubmitResult = await deleteResponse.json();

      expect(failedSubmitResult).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 404 - cannot delete a deleted template', async ({
      request,
    }) => {
      const { multipart, contentType } =
        TemplateAPIPayloadFactory.getCreateLetterTemplatePayload(
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
              file: pdfUploadFixtures.withPersonalisation.pdf.open(),
            },
            {
              _type: 'file',
              partName: 'testCsv',
              fileName: 'test-data.csv',
              fileType: 'text/csv',
              file: pdfUploadFixtures.withPersonalisation.csv.open(),
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

      const createResult = await createResponse.json();

      const debug = JSON.stringify(createResult, null, 2);

      templateStorageHelper.addAdHocTemplateKey({
        id: createResult.template.id,
        owner: user1.userId,
      });

      expect(createResponse.status(), debug).toBe(201);

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const failedDeleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedDeleteResponse.status()).toBe(404);

      const failedDeleteBody = await failedDeleteResponse.json();

      expect(failedDeleteBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });
  });

  test.describe('NHS_APP templates', () => {
    test('returns 204', async ({ request }) => {
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
    });

    test('returns 400 - cannot delete a submitted template', async ({
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

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(400);

      const updateResponseBody = await deleteResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 404 - cannot delete a deleted template', async ({
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

      const failedDeleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedDeleteResponse.status()).toBe(404);

      const failedDeleteBody = await failedDeleteResponse.json();

      expect(failedDeleteBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });
  });

  test.describe('SMS templates', () => {
    test('returns 204', async ({ request }) => {
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
    });

    test('returns 400 - cannot delete a submitted template', async ({
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

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(400);

      const updateResponseBody = await deleteResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 404 - cannot delete a deleted template', async ({
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

      const failedDeleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedDeleteResponse.status()).toBe(404);

      const failedDeleteBody = await failedDeleteResponse.json();

      expect(failedDeleteBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });
  });

  test.describe('EMAIL templates', () => {
    test('returns 204', async ({ request }) => {
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
    });

    test('returns 400 - cannot delete a submitted template', async ({
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

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(deleteResponse.status()).toBe(400);

      const updateResponseBody = await deleteResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 404 - cannot delete a deleted template', async ({
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

      const failedDeleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedDeleteResponse.status()).toBe(404);

      const failedDeleteBody = await failedDeleteResponse.json();

      expect(failedDeleteBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });
  });
});
