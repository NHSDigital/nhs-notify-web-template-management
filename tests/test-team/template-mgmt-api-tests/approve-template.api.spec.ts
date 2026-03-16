import { test, expect } from '@playwright/test';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  isoDateRegExp,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import { getTestContext } from '../helpers/context/context';

test.describe('PATCH /v1/template/:templateId/approve', () => {
  const context = getTestContext();
  const templateStorageHelper = new TemplateStorageHelper();
  let userRoutingDisabled: TestUser;
  let userLetterAuthoring: TestUser;
  let userLetterAuthoringSharedClient: TestUser;

  test.beforeAll(async () => {
    userRoutingDisabled = await context.auth.getTestUser(
      testUsers.User2.userId
    );
    userLetterAuthoring = await context.auth.getTestUser(
      testUsers.UserLetterAuthoringEnabled.userId
    );
    userLetterAuthoringSharedClient = await context.auth.getTestUser(
      testUsers.UserLetterAuthoringEnabledSharedClient.userId
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
    await templateStorageHelper.deleteSeededTemplates();
  });

  const createAuthoringLetterTemplate = async (
    user: TestUser,
    templateStatus = 'NOT_YET_SUBMITTED'
  ): Promise<Template> => {
    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'Test Authoring Letter template',
      templateStatus
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    return letterTemplate;
  };

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/some-template/approve`,
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
      `${process.env.API_BASE_URL}/v1/template/noexist/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
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

  test('returns 404 if template exists but is owned by a different client', async ({
    request,
  }) => {
    const { id: templateId, lockNumber } =
      await createAuthoringLetterTemplate(userLetterAuthoring);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userRoutingDisabled.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 400 if the lock number header is not set', async ({
    request,
  }) => {
    const { id: templateId } =
      await createAuthoringLetterTemplate(userLetterAuthoring);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Invalid lock number provided',
    });
  });

  test('returns 409 if the lock number does not match', async ({ request }) => {
    const { id: templateId, lockNumber } =
      await createAuthoringLetterTemplate(userLetterAuthoring);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber + 1),
        },
      }
    );

    expect(response.status()).toBe(409);
    expect(await response.json()).toEqual({
      statusCode: 409,
      technicalMessage:
        'Lock number mismatch - Template has been modified since last read',
    });
  });

  test.only('returns 200 and sets status to PROOF_APPROVED', async ({
    request,
  }) => {
    const {
      id: templateId,
      name,
      templateType,
      createdAt,
      lockNumber,
    } = await createAuthoringLetterTemplate(userLetterAuthoring);

    const start = new Date();

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    expect(response.status()).toBe(200);

    const result = await response.json();

    expect(result).toEqual({
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

    expect(result.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(result.data.createdAt).toEqual(createdAt);
  });

  test('user belonging to the same client as the creator can approve', async ({
    request,
  }) => {
    const created = await createAuthoringLetterTemplate(userLetterAuthoring);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${created.id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoringSharedClient.getAccessToken(),
          'X-Lock-Number': String(created.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(200);

    const result = await response.json();

    expect(userLetterAuthoring.clientId).toBe(
      userLetterAuthoringSharedClient.clientId
    );

    expect(result).toEqual({
      statusCode: 200,
      data: expect.objectContaining({
        clientId: userLetterAuthoring.clientId,
        createdAt: created.createdAt,
        id: created.id,
        templateStatus: 'PROOF_APPROVED',
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: created.lockNumber + 1,
        updatedBy: `INTERNAL_USER#${userLetterAuthoringSharedClient.internalUserId}`,
      }),
    });
  });

  test('returns 400 - cannot approve an already approved template', async ({
    request,
  }) => {
    const { id: templateId, lockNumber } =
      await createAuthoringLetterTemplate(userLetterAuthoring);

    const approveResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const approveResult = await approveResponse.json();

    expect(
      approveResponse.status(),
      JSON.stringify(approveResult, null, 2)
    ).toBe(200);

    const failedResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(approveResult.data.lockNumber),
        },
      }
    );

    expect(failedResponse.status()).toBe(400);
    expect(await failedResponse.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be approved',
    });
  });

  test('returns 400 - cannot approve a non-letter template', async ({
    request,
  }) => {
    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
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
      clientId: userLetterAuthoring.clientId,
    });

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(created.data.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be approved',
    });
  });

  test('returns 400 - cannot approve a PDF letter template', async ({
    request,
  }) => {
    const pdfLetterTemplate = TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test PDF Letter template'
    );

    await templateStorageHelper.seedTemplateData([pdfLetterTemplate]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${pdfLetterTemplate.id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(pdfLetterTemplate.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be approved',
    });
  });

  test('returns 404 - cannot approve a deleted template', async ({
    request,
  }) => {
    const { id: templateId, lockNumber } =
      await createAuthoringLetterTemplate(userLetterAuthoring);

    const deleteResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/${templateId}`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    expect(deleteResponse.status()).toBe(204);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber + 1),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });
});
