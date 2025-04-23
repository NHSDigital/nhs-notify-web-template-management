import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  isoDateRegExp,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import {
  UseCaseOrchestrator,
  SimulateFailedVirusScan,
  SimulatePassedValidation,
} from '../helpers/use-cases';

test.describe('POST /v1/template/:templateId/submit', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const orchestrator = new UseCaseOrchestrator();
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(TestUserId.User1);
    user2 = await authHelper.getTestUser(TestUserId.User2);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/some-template/submit`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if template does not exist', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/noexist/submit`,
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

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
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
    test('returns 200 and the updated template data', async ({ request }) => {
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

      expect(createResponse.status(), debug).toBe(201);

      templateStorageHelper.addAdHocTemplateKey({
        id: createResult.template.id,
        owner: user1.userId,
      });

      await orchestrator.send(
        new SimulatePassedValidation({
          templateId: createResult.template.id,
          templateOwner: user1.userId,
          hasTestData: true,
        })
      );

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: expect.objectContaining({
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          name: createResult.template.name,
          templateStatus: 'SUBMITTED',
          templateType: createResult.template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        }),
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(
        createResult.template.createdAt
      );
    });

    test('returns 400 - cannot submit a submitted template', async ({
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

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedSubmitResponse.status()).toBe(400);

      const failedSubmitResult = await failedSubmitResponse.json();

      expect(failedSubmitResult).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 400 - cannot submit a template when status is VIRUS_SCAN_FAILED', async ({
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

      const failedVirusScanUpdate = await orchestrator.send(
        new SimulateFailedVirusScan({
          templateId: createResult.template.id,
          templateOwner: user1.userId,
          filePath: 'files.pdfTemplate.virusScanStatus',
        })
      );

      expect(
        failedVirusScanUpdate.templateStatus,
        JSON.stringify(failedVirusScanUpdate, null, 2)
      ).toBe('VIRUS_SCAN_FAILED');

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      const submitResult = await submitResponse.json();

      expect(submitResponse.status()).toBe(400);

      expect(submitResult).toEqual({
        statusCode: 400,
        technicalMessage: 'Template cannot be submitted',
      });
    });

    test('returns 404 - cannot submit a deleted template', async ({
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

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${createResult.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(updateResponse.status()).toBe(404);

      const updateResponseBody = await updateResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
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

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: created.template.message,
          name: created.template.name,
          templateStatus: 'SUBMITTED',
          templateType: created.template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(created.template.createdAt);
    });

    test('returns 400 - cannot submit a submitted template', async ({
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

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedSubmitResponse.status()).toBe(400);

      const updateResponseBody = await failedSubmitResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 404 - cannot submit a deleted template', async ({
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

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedSubmitResponse.status()).toBe(404);

      const updateResponseBody = await failedSubmitResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
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

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: created.template.message,
          name: created.template.name,
          templateStatus: 'SUBMITTED',
          templateType: created.template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(created.template.createdAt);
    });

    test('returns 400 - cannot submit a submitted template', async ({
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

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedSubmitResponse.status()).toBe(400);

      const updateResponseBody = await failedSubmitResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 404 - cannot submit a deleted template', async ({
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

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedSubmitResponse.status()).toBe(404);

      const updateResponseBody = await failedSubmitResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
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

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: created.template.message,
          name: created.template.name,
          subject: created.template.subject,
          templateStatus: 'SUBMITTED',
          templateType: created.template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.template.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.template.createdAt).toEqual(created.template.createdAt);
    });

    test('returns 400 - cannot submit a submitted template', async ({
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

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedSubmitResponse.status()).toBe(400);

      const updateResponseBody = await failedSubmitResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 400,
        technicalMessage: 'Template with status SUBMITTED cannot be updated',
      });
    });

    test('returns 404 - cannot submit a deleted template', async ({
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

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
        }
      );

      expect(failedSubmitResponse.status()).toBe(404);

      const updateResponseBody = await failedSubmitResponse.json();

      expect(updateResponseBody).toEqual({
        statusCode: 404,
        technicalMessage: 'Template not found',
      });
    });
  });
});
