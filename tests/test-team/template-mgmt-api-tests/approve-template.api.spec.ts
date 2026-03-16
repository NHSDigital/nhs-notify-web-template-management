import { test, expect } from '@playwright/test';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  isoDateRegExp,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { getTestContext } from '../helpers/context/context';

test.describe('PATCH /v1/template/:templateId/approve', () => {
  const context = getTestContext();
  const templateStorageHelper = new TemplateStorageHelper();
  let userDifferentClient: TestUser;
  let userLetterAuthoring: TestUser;
  let userLetterAuthoringSharedClient: TestUser;

  test.beforeAll(async () => {
    userDifferentClient = await context.auth.getTestUser(
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

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(404);
    expect(data).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 404 if template exists but is owned by a different client', async ({
    request,
  }) => {
    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template'
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id: templateId, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(404);
    expect(data).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 400 if the lock number header is not set', async ({
    request,
  }) => {
    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template'
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id: templateId } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage: 'Invalid lock number provided',
    });
  });

  test('returns 409 if the lock number does not match', async ({ request }) => {
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        longFormRender: { status: 'RENDERED' },
        shortFormRender: { status: 'RENDERED' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id: templateId, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber + 1),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(409);
    expect(data).toEqual({
      statusCode: 409,
      technicalMessage:
        'Lock number mismatch - Template has been modified since last read',
    });
  });

  test('returns 200 and sets status to PROOF_APPROVED', async ({ request }) => {
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        longFormRender: { status: 'RENDERED' },
        shortFormRender: { status: 'RENDERED' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id: templateId, lockNumber, createdAt, name } = letterTemplate;

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

    const result = await response.json();

    expect(response.status(), JSON.stringify(result, null, 2)).toBe(200);

    expect(result).toEqual({
      statusCode: 200,
      data: expect.objectContaining({
        createdAt: expect.stringMatching(isoDateRegExp),
        id: expect.stringMatching(uuidRegExp),
        name,
        templateStatus: 'PROOF_APPROVED',
        templateType: 'LETTER',
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
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        longFormRender: { status: 'RENDERED' },
        shortFormRender: { status: 'RENDERED' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { createdAt, lockNumber, id } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoringSharedClient.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const result = await response.json();

    expect(response.status(), JSON.stringify(result, null, 2)).toBe(200);

    expect(userLetterAuthoring.clientId).toBe(
      userLetterAuthoringSharedClient.clientId
    );

    expect(result).toEqual({
      statusCode: 200,
      data: expect.objectContaining({
        clientId: userLetterAuthoring.clientId,
        createdAt,
        id,
        templateStatus: 'PROOF_APPROVED',
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: lockNumber + 1,
        updatedBy: `INTERNAL_USER#${userLetterAuthoringSharedClient.internalUserId}`,
      }),
    });
  });

  test('returns 400 - cannot approve an already approved template', async ({
    request,
  }) => {
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        longFormRender: { status: 'RENDERED' },
        shortFormRender: { status: 'RENDERED' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { lockNumber, id } = letterTemplate;

    const approveResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
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
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(approveResult.data.lockNumber),
        },
      }
    );

    const failedResult = await failedResponse.json();

    expect(failedResponse.status(), JSON.stringify(failedResult)).toBe(400);
    expect(failedResult).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be approved',
    });
  });

  test('returns 400 - cannot approve a non-letter template', async ({
    request,
  }) => {
    const appTemplate = TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      userLetterAuthoring
    );

    await templateStorageHelper.seedTemplateData([appTemplate]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${appTemplate.id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(appTemplate.lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
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

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be approved',
    });
  });

  test('returns 404 - cannot approve a deleted template', async ({
    request,
  }) => {
    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'DELETED'
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { lockNumber, id } = letterTemplate;

    const approveResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber + 1),
        },
      }
    );

    const data = await approveResponse.json();

    expect(approveResponse.status(), JSON.stringify(data)).toBe(404);
    expect(data).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 400 - cannot approve template without campaignId', async ({
    request,
  }) => {
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        campaignId: null,
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be approved',
    });
  });

  test('returns 400 - cannot approve template without letterVariantId', async ({
    request,
  }) => {
    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be approved',
    });
  });

  test('returns 400 - cannot approve when shortFormRender is missing', async ({
    request,
  }) => {
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        shortFormRender: false,
        longFormRender: { status: 'RENDERED' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage:
        'One or more personalised rendered example has not been generated',
    });
  });

  test('returns 400 - cannot approve when longFormRender is missing', async ({
    request,
  }) => {
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        shortFormRender: { status: 'RENDERED' },
        longFormRender: false,
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage:
        'One or more personalised rendered example has not been generated',
    });
  });

  test('returns 400 - cannot approve when renders are not yet complete', async ({
    request,
  }) => {
    const [letterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant.id,
        shortFormRender: { status: 'PENDING' },
        longFormRender: { status: 'PENDING' },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage:
        'One or more personalised rendered example has not been generated',
    });
  });

  test('returns 400 - page count exceeds max sheets allowed by letter variant', async ({
    request,
  }) => {
    const globalVariants =
      await context.letterVariants.getGlobalLetterVariants();

    // Pick a variant with maxSheets: 5 and bothSides: true
    // ceil(11 / 2) = 6 sheets which exceeds maxSheets of 5
    const letterVariant = globalVariants.find(
      (v) => v.maxSheets === 5 && v.bothSides
    );

    expect(letterVariant).toBeDefined();

    const letterTemplate = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      userLetterAuthoring,
      'Test Authoring Letter template',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: letterVariant!.id,
        shortFormRender: { status: 'RENDERED', pageCount: 11 },
        longFormRender: { status: 'RENDERED', pageCount: 11 },
      }
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { id, lockNumber } = letterTemplate;

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${id}/approve`,
      {
        headers: {
          Authorization: await userLetterAuthoring.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    const data = await response.json();

    expect(response.status(), JSON.stringify(data)).toBe(400);
    expect(data).toEqual({
      statusCode: 400,
      technicalMessage:
        'Letter template exceeded maximum number of sheets allowed by letter variant',
    });
  });
});
