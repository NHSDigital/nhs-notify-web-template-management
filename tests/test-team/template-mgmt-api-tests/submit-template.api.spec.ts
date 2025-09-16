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
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import {
  UseCaseOrchestrator,
  SimulateFailedVirusScan,
  SimulatePassedValidation,
} from '../helpers/use-cases';
import { EmailHelper } from '../helpers/email-helper';
import { testClients } from '../helpers/client/client-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';

test.describe('POST /v1/template/:templateId/submit', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const orchestrator = new UseCaseOrchestrator();
  let user1: TestUser;
  let user2: TestUser;
  let userSharedClient: TestUser;
  let userProofingDisabled: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    user2 = await authHelper.getTestUser(testUsers.User2.userId);
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
    userProofingDisabled = await authHelper.getTestUser(testUsers.User4.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
    await templateStorageHelper.deleteSeededTemplates();
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
      templateId: created.template.id,
      clientId: user1.clientId,
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
        TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
          {
            templateType: 'LETTER',
            campaignId: 'Campaign1',
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

      const { id: templateId, name: templateName } = createResult.template;

      expect(createResponse.status(), debug).toBe(201);

      templateStorageHelper.addAdHocTemplateKey({
        templateId: templateId,
        clientId: user1.clientId,
      });

      await orchestrator.send(
        new SimulatePassedValidation({
          templateId,
          clientId: user1.clientId,
          hasTestData: true,
        })
      );

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
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

      // check email
      const emailHelper = new EmailHelper();

      await expect(async () => {
        const emailContents = await emailHelper.getEmailForTemplateId(
          process.env.TEST_EMAIL_BUCKET_PREFIX,
          templateId,
          start,
          'template-submitted-sender'
        );

        expect(emailContents).toContain(templateId);
        expect(emailContents).toContain(templateName);
        expect(emailContents).toContain('Template Submitted');
        expect(emailContents).toContain('proof.pdf');
      }).toPass({ timeout: 20_000 });
    });

    test('returns 400 - cannot submit a submitted template', async ({
      request,
    }) => {
      const { multipart, contentType } =
        TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
          {
            templateType: 'LETTER',
            campaignId: 'Campaign1',
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
        templateId: createResult.template.id,
        clientId: user1.clientId,
      });

      expect(createResponse.status(), debug).toBe(201);

      await orchestrator.send(
        new SimulatePassedValidation({
          templateId: createResult.template.id,
          clientId: user1.clientId,
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
        TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
          {
            templateType: 'LETTER',
            campaignId: 'Campaign1',
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
        templateId: createResult.template.id,
        clientId: user1.clientId,
      });

      expect(createResponse.status(), debug).toBe(201);

      const failedVirusScanUpdate = await orchestrator.send(
        new SimulateFailedVirusScan({
          templateId: createResult.template.id,
          clientId: user1.clientId,
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
        TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
          {
            templateType: 'LETTER',
            campaignId: 'Campaign1',
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
        templateId: createResult.template.id,
        clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
          clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
          clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
          clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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
        templateId: created.template.id,
        clientId: user1.clientId,
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

  test.describe('shared ownership', () => {
    test('user belonging to the same client as the creator can submit', async ({
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
        templateId: created.template.id,
        clientId: user1.clientId,
      });

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.template.id}/submit`,
        {
          headers: {
            Authorization: await userSharedClient.getAccessToken(),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(user1.clientId).toBe(userSharedClient.clientId);

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          clientId: user1.clientId,
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
    });
  });

  test.describe('user-owned templates', () => {
    test('user-owner can submit digital template', async ({ request }) => {
      const templateId = crypto.randomUUID();

      const template = {
        ...TemplateFactory.createEmailTemplate(templateId, user1),
        owner: user1.userId,
      };

      await templateStorageHelper.seedTemplateData([template]);

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
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
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          subject: template.subject,
          name: template.name,
          templateStatus: 'SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });
    });

    test('user-owner can submit letter template with proofing disabled', async ({
      request,
    }) => {
      const templateId = crypto.randomUUID();

      const template = {
        ...TemplateFactory.uploadLetterTemplate(
          templateId,
          userProofingDisabled,
          templateId,
          'NOT_YET_SUBMITTED'
        ),
        owner: userProofingDisabled.userId,
        proofingEnabled: false,
      };

      await templateStorageHelper.seedTemplateData([template]);

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
        {
          headers: {
            Authorization: await userProofingDisabled.getAccessToken(),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        template: {
          campaignId: testClients[userProofingDisabled.clientKey]?.campaignId,
          clientId: userProofingDisabled.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          name: template.name,
          templateStatus: 'SUBMITTED',
          templateType: 'LETTER',
          updatedAt: expect.stringMatching(isoDateRegExp),
          language: template.language,
          proofingEnabled: false,
          letterType: template.letterType,
          personalisationParameters: [],
          files: {
            pdfTemplate: expect.objectContaining({
              virusScanStatus: 'PASSED',
            }),
            proofs: {},
            testDataCsv: expect.objectContaining({
              virusScanStatus: 'PASSED',
            }),
          },
        },
      });
    });

    test('user-owner can submit letter template with proofing enabled', async ({
      request,
    }) => {
      const templateId = crypto.randomUUID();

      const baseTemplateData = TemplateFactory.uploadLetterTemplate(
        templateId,
        user1,
        templateId,
        'PROOF_AVAILABLE'
      );

      const proofs = {
        'first.pdf': {
          virusScanStatus: 'PASSED',
          supplier: 'WTMMOCK',
          fileName: 'first.pdf',
        },
      };

      const template = {
        ...baseTemplateData,
        owner: user1.userId,
        proofingEnabled: true,
        files: { ...baseTemplateData.files, proofs },
        campaignId: testClients[user1.clientKey]?.campaignIds?.[0],
      };

      await templateStorageHelper.seedTemplateData([template]);

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
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
          campaignId: testClients[user1.clientKey]?.campaignIds?.[0],
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          name: template.name,
          templateStatus: 'SUBMITTED',
          templateType: 'LETTER',
          updatedAt: expect.stringMatching(isoDateRegExp),
          language: template.language,
          proofingEnabled: true,
          personalisationParameters: [],
          letterType: template.letterType,
          files: {
            pdfTemplate: expect.objectContaining({
              virusScanStatus: 'PASSED',
            }),
            proofs,
            testDataCsv: expect.objectContaining({
              virusScanStatus: 'PASSED',
            }),
          },
        },
      });
    });
  });
});
