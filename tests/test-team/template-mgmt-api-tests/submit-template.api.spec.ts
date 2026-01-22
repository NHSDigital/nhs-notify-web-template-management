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
import { EmailHelper } from '../helpers/email-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { Template } from 'helpers/types';

test.describe('POST /v1/template/:templateId/submit', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let userRoutingDisabled: TestUser;
  let userSharedClient: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/some-template/submit`,
      {
        headers: {
          'X-Lock-Number': '0',
        },
      }
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
          'X-Lock-Number': '0',
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
      templateId: created.data.id,
      clientId: user1.clientId,
    });

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
      {
        headers: {
          Authorization: await userRoutingDisabled.getAccessToken(),
          'X-Lock-Number': String(created.data.lockNumber),
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
    const createProofAvailableLetterTemplate = async (
      user: TestUser
    ): Promise<Template> => {
      const letterTemplate = TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        user,
        'Test Letter template',
        'PROOF_AVAILABLE'
      );

      await templateStorageHelper.seedTemplateData([
        {
          ...letterTemplate,
          files: {
            ...letterTemplate.files,
            proofs: {
              proof1: {
                fileName: 'proof.pdf',
                supplier: 'WTMMOCK',
                virusScanStatus: 'PASSED',
              },
            },
          },
        },
      ]);

      return letterTemplate;
    };

    const createVirusScanFailedLetterTemplate = async (): Promise<Template> => {
      const letterTemplate = TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        user1,
        'Test Letter template',
        'VIRUS_SCAN_FAILED',
        'FAILED'
      );

      await templateStorageHelper.seedTemplateData([letterTemplate]);

      return letterTemplate;
    };

    test('returns 200 with PROOF_APPROVED status when routing is enabled', async ({
      request,
    }) => {
      const {
        id: templateId,
        name,
        templateType,
        createdAt,
        lockNumber,
      } = await createProofAvailableLetterTemplate(user1);

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(lockNumber),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: expect.objectContaining({
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          name,
          templateStatus: 'PROOF_APPROVED',
          templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: lockNumber + 1,
        }),
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);

      expect(updated.data.createdAt).toEqual(createdAt);
    });

    test('returns 200 with SUBMITTED status when routing is disabled, email is sent to supplier', async ({
      request,
    }) => {
      const letterTemplate = TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        userRoutingDisabled,
        'Test Letter template routing disabled',
        'PROOF_AVAILABLE'
      );

      await templateStorageHelper.seedTemplateData([
        {
          ...letterTemplate,
          files: {
            ...letterTemplate.files,
            proofs: {
              proof1: {
                fileName: 'proof.pdf',
                supplier: 'WTMMOCK',
                virusScanStatus: 'PASSED',
              },
            },
          },
        },
      ]);

      const {
        id: templateId,
        name,
        templateType,
        createdAt,
        lockNumber,
      } = letterTemplate;

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
        {
          headers: {
            Authorization: await userRoutingDisabled.getAccessToken(),
            'X-Lock-Number': String(lockNumber),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: expect.objectContaining({
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          name,
          templateStatus: 'SUBMITTED',
          templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: lockNumber + 1,
        }),
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);

      expect(updated.data.createdAt).toEqual(createdAt);

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
        expect(emailContents).toContain(name);
        expect(emailContents).toContain('Template Submitted');
        expect(emailContents).toContain('proof.pdf');
      }).toPass({ timeout: 20_000 });
    });

    test('returns 400 - cannot submit a submitted template', async ({
      request,
    }) => {
      const { id: templateId, lockNumber } =
        await createProofAvailableLetterTemplate(userRoutingDisabled);

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
        {
          headers: {
            Authorization: await userRoutingDisabled.getAccessToken(),
            'X-Lock-Number': String(lockNumber),
          },
        }
      );

      const submitResult = await submitResponse.json();

      expect(
        submitResponse.status(),
        JSON.stringify(submitResult, null, 2)
      ).toBe(200);

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
        {
          headers: {
            Authorization: await userRoutingDisabled.getAccessToken(),
            'X-Lock-Number': String(submitResult.data.lockNumber),
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
      const { id: templateId, lockNumber } =
        await createVirusScanFailedLetterTemplate();

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(lockNumber),
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
      const { id: templateId, lockNumber } =
        await createProofAvailableLetterTemplate(user1);

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${templateId}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(lockNumber),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(lockNumber + 1),
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: created.data.message,
          name: created.data.name,
          templateStatus: 'SUBMITTED',
          templateType: created.data.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: created.data.lockNumber + 1,
          createdBy: `INTERNAL_USER#${user1.internalUserId}`,
          updatedBy: `INTERNAL_USER#${user1.internalUserId}`,
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(created.data.createdAt);
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const submitted = await submitResponse.json();

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(submitted.data.lockNumber),
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber + 1),
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: created.data.message,
          name: created.data.name,
          templateStatus: 'SUBMITTED',
          templateType: created.data.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: created.data.lockNumber + 1,
          createdBy: `INTERNAL_USER#${user1.internalUserId}`,
          updatedBy: `INTERNAL_USER#${user1.internalUserId}`,
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(created.data.createdAt);
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const submitted = await submitResponse.json();

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(submitted.data.lockNumber),
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber + 1),
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: created.data.message,
          name: created.data.name,
          subject: created.data.subject,
          templateStatus: 'SUBMITTED',
          templateType: created.data.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: created.data.lockNumber + 1,
          createdBy: `INTERNAL_USER#${user1.internalUserId}`,
          updatedBy: `INTERNAL_USER#${user1.internalUserId}`,
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(created.data.createdAt);
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const submitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(submitResponse.status()).toBe(200);

      const submitted = await submitResponse.json();

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(submitted.data.lockNumber),
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const deleteResponse = await request.delete(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(deleteResponse.status()).toBe(204);

      const failedSubmitResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber + 1),
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
        templateId: created.data.id,
        clientId: user1.clientId,
      });

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
        {
          headers: {
            Authorization: await userSharedClient.getAccessToken(),
            'X-Lock-Number': String(created.data.lockNumber),
          },
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(user1.clientId).toBe(userSharedClient.clientId);

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          clientId: user1.clientId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: created.data.message,
          name: created.data.name,
          subject: created.data.subject,
          templateStatus: 'SUBMITTED',
          templateType: created.data.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: created.data.lockNumber + 1,
          createdBy: `INTERNAL_USER#${user1.internalUserId}`,
          updatedBy: `INTERNAL_USER#${userSharedClient.internalUserId}`,
        },
      });
    });
  });

  test('returns 409 if the lock number header is not set', async ({
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
      templateId: created.data.id,
      clientId: user1.clientId,
    });

    const submitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(submitResponse.status()).toBe(409);

    const body = await submitResponse.json();

    expect(body).toEqual({
      statusCode: 409,
      technicalMessage:
        'Lock number mismatch - Template has been modified since last read',
    });
  });

  test('returns 409 if the lock number header does not match the current one', async ({
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
      templateId: created.data.id,
      clientId: user1.clientId,
    });

    const submitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(created.data.lockNumber + 1),
        },
      }
    );

    expect(submitResponse.status()).toBe(409);

    const body = await submitResponse.json();

    expect(body).toEqual({
      statusCode: 409,
      technicalMessage:
        'Lock number mismatch - Template has been modified since last read',
    });
  });
});
