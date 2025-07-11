import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { randomUUID } from 'node:crypto';

test.describe('POST /v1/template/:templateId/proof @debug', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let userProofingEnabled: TestUser;
  let anotherUser: TestUser;
  let userWithoutClient: TestUser;

  test.beforeAll(async () => {
    userProofingEnabled = await authHelper.getTestUser(testUsers.User1.userId);
    anotherUser = await authHelper.getTestUser(testUsers.User2.userId);
    userWithoutClient = await authHelper.getTestUser(testUsers.User6.userId);
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
          Authorization: await userProofingEnabled.getAccessToken(),
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
    const userProofingEnabledtemplateId = randomUUID();

    await templateStorageHelper.seedTemplateData([
      TemplateFactory.createLetterTemplate(
        userProofingEnabledtemplateId,
        userProofingEnabled.userId,
        'userProofingEnabledtemplate',
        'PENDING_PROOF_REQUEST'
      ),
    ]);

    const updateResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${userProofingEnabledtemplateId}/proof`,
      {
        headers: {
          Authorization: await anotherUser.getAccessToken(),
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
        userProofingEnabled.userId,
        'userProofingEnabledtemplate',
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
          Authorization: await userProofingEnabled.getAccessToken(),
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
        userProofingEnabled.userId,
        'userProofingEnabledtemplate',
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
          Authorization: await userProofingEnabled.getAccessToken(),
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
      userProofingEnabled.userId,
      'userProofingEnabledtemplate'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const proofResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
      {
        headers: {
          Authorization: await userProofingEnabled.getAccessToken(),
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

  test('returns 403 - cannot request a proof when client proofing is not enabled', async ({
    request,
  }) => {
    const templateId = randomUUID();
    const currentVersion = randomUUID();

    const template = {
      ...TemplateFactory.createLetterTemplate(
        templateId,
        userProofingEnabled.userId,
        'userProofingEnabledtemplate',
        // template should not reach this status if proofing is not
        // enabled for the client
        'PENDING_PROOF_REQUEST'
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
          Authorization: await userWithoutClient.getAccessToken(),
        },
      }
    );

    const result = await proofResponse.json();

    const debug = JSON.stringify(result, null, 2);

    expect(proofResponse.status(), debug).toBe(403);

    expect(result).toEqual({
      statusCode: 403,
      technicalMessage: 'User cannot request a proof',
    });
  });
});
