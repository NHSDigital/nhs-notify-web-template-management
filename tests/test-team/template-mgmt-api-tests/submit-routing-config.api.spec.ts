import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { RoutingConfigStatus } from 'nhs-notify-backend-client';

test.describe('PATCH /v1/routing-configuration/:routingConfigId/submit', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let userDifferentClient: TestUser;
  let userSharedClient: TestUser;
  let userRoutingDisabled: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userDifferentClient = await authHelper.getTestUser(
      testUsers.UserRoutingEnabled.userId
    );
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if routing config does not exist', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/no-exist/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': '0',
        },
      }
    );
    const responseBody = await response.json();
    const dbg = JSON.stringify(responseBody);

    expect(response.status(), dbg).toBe(404);
    expect(responseBody).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing configuration not found',
    });
  });

  test('returns 404 if routing config exists but is owned by a different client', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(updateResponse.status()).toBe(404);
    expect(await updateResponse.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing configuration not found',
    });
  });

  test('returns 200 and the updated routing config data', async ({
    request,
  }) => {
    const templateId = randomUUID();

    // Create a template for the routing config to reference
    const template = TemplateFactory.createNhsAppTemplate(
      templateId,
      user1,
      'Test Template for Submit'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const { dbEntry, apiResponse } = RoutingConfigFactory.create(user1, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: templateId,
        },
      ],
    });

    await storageHelper.seed([dbEntry]);

    const start = new Date();

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: dbEntry.lockNumber + 1,
      },
    });

    expect(updated.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(updated.data.createdAt).toEqual(dbEntry.createdAt);
  });

  test('returns 400 - cannot submit a COMPLETED routing config', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1, {
      status: 'COMPLETED',
    });

    await storageHelper.seed([dbEntry]);

    const failedSubmitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(failedSubmitResponse.status()).toBe(400);

    const updateResponseBody = await failedSubmitResponse.json();

    expect(updateResponseBody).toEqual({
      statusCode: 400,
      technicalMessage:
        'Routing configuration with status COMPLETED cannot be updated',
    });
  });

  test('returns 404 - cannot submit a DELETED routing config', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    await storageHelper.seed([dbEntry]);

    const failedSubmitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(failedSubmitResponse.status()).toBe(404);

    const updateResponseBody = await failedSubmitResponse.json();

    expect(updateResponseBody).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing configuration not found',
    });
  });

  test('user belonging to the same client as the creator can submit', async ({
    request,
  }) => {
    const templateId = randomUUID();

    // Create a template for the routing config to reference
    const template = TemplateFactory.createNhsAppTemplate(
      templateId,
      user1,
      'Test Template for Shared Client Submit'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const { dbEntry, apiResponse } = RoutingConfigFactory.create(user1, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: templateId,
        },
      ],
    });

    await storageHelper.seed([dbEntry]);

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(user1.clientId).toBe(userSharedClient.clientId);

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: dbEntry.lockNumber + 1,
      },
    });
  });

  test('returns 400 if routing feature is disabled on the client', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await userRoutingDisabled.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Routing feature is disabled',
    });
  });

  test('returns 400 if the lock number header is not set', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Invalid lock number provided',
    });
  });

  test('returns 409 if the lock number header does not match the current one', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber + 1),
        },
      }
    );

    expect(response.status()).toBe(409);

    expect(await response.json()).toEqual({
      statusCode: 409,
      technicalMessage:
        'Lock number mismatch - Message Plan has been modified since last read',
    });
  });

  test.describe('cascade validation', () => {
    test('returns 400 if cascade item has no defaultTemplateId and no conditionalTemplates', async ({
      request,
    }) => {
      const { dbEntry } = RoutingConfigFactory.create(user1, {
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
            defaultTemplateId: null,
          },
        ],
      });

      await storageHelper.seed([dbEntry]);

      const response = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage:
          'Routing config is not ready for submission: all cascade items must have templates assigned',
      });
    });

    test('returns 400 if cascade item has empty conditionalTemplates array', async ({
      request,
    }) => {
      const { dbEntry } = RoutingConfigFactory.create(user1, {
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
            conditionalTemplates: [],
          },
        ],
      });

      await storageHelper.seed([dbEntry]);

      const response = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
          },
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage:
          'Routing config is not ready for submission: all cascade items must have templates assigned',
      });
    });

    test('returns 200 if cascade item has conditionalTemplates instead of defaultTemplateId', async ({
      request,
    }) => {
      const frenchTemplateId = randomUUID();
      const arabicTemplateId = randomUUID();

      // Create templates for conditional templates
      const frenchTemplate = TemplateFactory.uploadLetterTemplate(
        frenchTemplateId,
        user1,
        'French Letter Template',
        'PROOF_APPROVED',
        'PASSED',
        { language: 'fr' }
      );

      const arabicTemplate = TemplateFactory.uploadLetterTemplate(
        arabicTemplateId,
        user1,
        'Arabic Letter Template',
        'PROOF_APPROVED',
        'PASSED',
        { language: 'ar' }
      );

      await templateStorageHelper.seedTemplateData([
        frenchTemplate,
        arabicTemplate,
      ]);

      const { dbEntry } = RoutingConfigFactory.create(user1, {
        cascade: [
          {
            cascadeGroups: ['translations'],
            channel: 'LETTER',
            channelType: 'primary',
            // No defaultTemplateId - using conditionalTemplates instead
            conditionalTemplates: [
              { language: 'fr', templateId: frenchTemplateId },
              { language: 'ar', templateId: arabicTemplateId },
            ],
          },
        ],
        cascadeGroupOverrides: [
          { name: 'translations', language: ['fr', 'ar'] },
        ],
      });

      await storageHelper.seed([dbEntry]);

      const response = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
          },
        }
      );

      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.data.status).toBe('COMPLETED');
    });
  });

  test('returns 400 if referenced template does not exist', async ({
    request,
  }) => {
    const nonExistentTemplateId = 'non-existent-template-id';

    const { dbEntry } = RoutingConfigFactory.create(user1, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: nonExistentTemplateId,
        },
      ],
    });

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Some templates not found',
      details: {
        templateIds: nonExistentTemplateId,
      },
    });
  });

  test('returns 400 if referenced template has DELETED status', async ({
    request,
  }) => {
    const deletedTemplateId = randomUUID();

    // Create a template with DELETED status
    const deletedTemplate = TemplateFactory.createNhsAppTemplate(
      deletedTemplateId,
      user1,
      'Deleted Template'
    );
    deletedTemplate.templateStatus = 'DELETED';

    await templateStorageHelper.seedTemplateData([deletedTemplate]);

    const { dbEntry } = RoutingConfigFactory.create(user1, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: deletedTemplateId,
        },
      ],
    });

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Some templates not found',
      details: {
        templateIds: deletedTemplateId,
      },
    });
  });

  test('returns 400 if LETTER template has status NOT_YET_SUBMITTED', async ({
    request,
  }) => {
    const letterTemplateId = randomUUID();

    // Create a LETTER template with NOT_YET_SUBMITTED status
    const letterTemplate = TemplateFactory.uploadLetterTemplate(
      letterTemplateId,
      user1,
      'Test Letter Template',
      'NOT_YET_SUBMITTED'
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { dbEntry } = RoutingConfigFactory.create(user1, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: letterTemplateId,
        },
      ],
    });

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage:
        'Letter templates must have status PROOF_APPROVED or SUBMITTED',
      details: {
        templateIds: letterTemplateId,
      },
    });
  });

  test('returns 200 if LETTER template has status PROOF_APPROVED', async ({
    request,
  }) => {
    const letterTemplateId = randomUUID();

    // Create a LETTER template with PROOF_APPROVED status
    const letterTemplate = TemplateFactory.uploadLetterTemplate(
      letterTemplateId,
      user1,
      'Test Letter Template',
      'PROOF_APPROVED'
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { dbEntry } = RoutingConfigFactory.create(user1, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: letterTemplateId,
        },
      ],
    });

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.data.status).toBe('COMPLETED');
  });

  test('returns 200 if LETTER template has status SUBMITTED', async ({
    request,
  }) => {
    const letterTemplateId = randomUUID();

    // Create a LETTER template with SUBMITTED status
    const letterTemplate = TemplateFactory.uploadLetterTemplate(
      letterTemplateId,
      user1,
      'Test Letter Template',
      'SUBMITTED'
    );

    await templateStorageHelper.seedTemplateData([letterTemplate]);

    const { dbEntry } = RoutingConfigFactory.create(user1, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: letterTemplateId,
        },
      ],
    });

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.data.status).toBe('COMPLETED');
  });
});
