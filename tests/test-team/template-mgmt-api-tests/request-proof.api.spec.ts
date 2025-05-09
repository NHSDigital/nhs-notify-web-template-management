import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { randomUUID } from 'node:crypto';

test.describe('POST /v1/template/:templateId/proof @debug', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(TestUserId.User1);
    user2 = await authHelper.getTestUser(TestUserId.User2);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template/some-template/proof`
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(401);
    expect(result).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if template does not exist', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template/noexist/proof`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(404);
    expect(result).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 404 if template exists but is owned by a different user', async ({
    request,
  }) => {
    const user1templateId = randomUUID();

    await templateStorageHelper.seedTemplateData([
      TemplateFactory.createLetterTemplate(
        user1templateId,
        user1.userId,
        'user1template',
        'PENDING_PROOF_REQUEST'
      ),
    ]);

    const updateResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${user1templateId}/proof`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    const result = await updateResponse.json();
    const debug = JSON.stringify(result, null, 2);

    expect(updateResponse.status(), debug).toBe(404);
    expect(result).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 200 and the updated template data', async ({ request }) => {
    const templateId = randomUUID();
    const currentVersion = randomUUID();

    const template = {
      ...TemplateFactory.createLetterTemplate(
        templateId,
        user1.userId,
        'user1template',
        'PENDING_PROOF_REQUEST'
      ),
      files: {
        pdfTemplate: {
          virusScanStatus: 'PASSED',
          currentVersion,
          fileName: 'template.pdf',
        },
        testDataCsv: {
          virusScanStatus: 'PASSED',
          currentVersion,
          fileName: 'data.csv',
        },
      },
    };

    await templateStorageHelper.seedTemplateData([template]);

    const start = new Date();

    const requestProofResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    const result = await requestProofResponse.json();
    const debug = JSON.stringify(result, null, 2);

    expect(requestProofResponse.status(), debug).toBe(200);

    expect(result).toEqual({
      statusCode: 200,
      template: expect.objectContaining({
        name: template.name,
        templateStatus: 'WAITING_FOR_PROOF',
        templateType: template.templateType,
      }),
    });

    expect(result.template.updatedAt).toBeDateRoughlyBetween([
      start,
      new Date(),
    ]);
  });

  test('returns 400 - cannot request a proof for a template where the status is not PENDING_PROOF_REQUEST', async ({
    request,
  }) => {
    const templateId = randomUUID();
    const currentVersion = randomUUID();

    const template = {
      ...TemplateFactory.createLetterTemplate(
        templateId,
        user1.userId,
        'user1template',
        'PENDING_VALIDATION'
      ),
      files: {
        pdfTemplate: {
          virusScanStatus: 'PASSED',
          currentVersion,
          fileName: 'template.pdf',
        },
      },
    };

    await templateStorageHelper.seedTemplateData([template]);

    const proofResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    const result = await proofResponse.json();
    const debug = JSON.stringify(result, null, 2);

    expect(proofResponse.status(), debug).toBe(400);

    expect(result).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be proofed',
    });
  });

  test('returns 400 - cannot request a proof for a non-letter', async ({
    request,
  }) => {
    const templateId = randomUUID();

    const template = TemplateFactory.createEmailTemplate(
      templateId,
      user1.userId,
      'user1template'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const proofResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    const result = await proofResponse.json();
    const debug = JSON.stringify(result, null, 2);

    expect(proofResponse.status(), debug).toBe(400);

    expect(result).toEqual({
      statusCode: 400,
      technicalMessage: 'Template cannot be proofed',
    });
  });
});
