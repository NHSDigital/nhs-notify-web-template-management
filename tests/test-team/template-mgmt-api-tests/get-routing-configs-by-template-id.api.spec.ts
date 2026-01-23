import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';

test.describe('GET /v1/routing-configs-by-template-id/:templateId', () => {
  const authHelper = createAuthHelper();
  const routingConfigStorageHelper = new RoutingConfigStorageHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configs-by-template-id/some-template`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 200 with empty array when template not included in any routing configs', async ({
    request,
  }) => {
    const templateId = randomUUID();
    const template = TemplateFactory.createNhsAppTemplate(
      templateId,
      user1,
      'Template without routing configs'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configs-by-template-id/${templateId}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: [],
    });
  });

  test('returns 200 with routing config references when template is used in message plans', async ({
    request,
  }) => {
    const templateId = randomUUID();
    const template = TemplateFactory.createNhsAppTemplate(
      templateId,
      user1,
      'Template in message plans'
    );

    const messagePlan1 = RoutingConfigFactory.createForMessageOrder(
      user1,
      'NHSAPP',
      { name: 'Message Plan 1' }
    ).addTemplate('NHSAPP', templateId).dbEntry;

    const messagePlan2 = RoutingConfigFactory.createForMessageOrder(
      user1,
      'NHSAPP',
      { name: 'Message Plan 2' }
    ).addTemplate('NHSAPP', templateId).dbEntry;

    await templateStorageHelper.seedTemplateData([template]);
    await routingConfigStorageHelper.seed([messagePlan1, messagePlan2]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configs-by-template-id/${templateId}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.statusCode).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data).toEqual(
      expect.arrayContaining([
        { id: messagePlan1.id, name: 'Message Plan 1' },
        { id: messagePlan2.id, name: 'Message Plan 2' },
      ])
    );
  });

  test('returns 200 with routing config references for conditional templates', async ({
    request,
  }) => {
    const templateId = randomUUID();
    const template = TemplateFactory.uploadLetterTemplate(
      templateId,
      user1,
      'Large print letter template',
      'PROOF_APPROVED',
      'PASSED',
      { letterType: 'x1' }
    );

    const messagePlan = RoutingConfigFactory.createForMessageOrder(
      user1,
      'LETTER',
      { name: 'Letter Message Plan' }
    ).addAccessibleFormatTemplate('x1', templateId).dbEntry;

    await templateStorageHelper.seedTemplateData([template]);
    await routingConfigStorageHelper.seed([messagePlan]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configs-by-template-id/${templateId}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.statusCode).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data).toEqual([
      { id: messagePlan.id, name: 'Letter Message Plan' },
    ]);
  });

  test('returns 200 excludes deleted routing configs', async ({ request }) => {
    const templateId = randomUUID();
    const template = TemplateFactory.createNhsAppTemplate(
      templateId,
      user1,
      'Template with deleted plan'
    );

    const activePlan = RoutingConfigFactory.createForMessageOrder(
      user1,
      'NHSAPP',
      { name: 'Active Plan' }
    ).addTemplate('NHSAPP', templateId).dbEntry;

    const deletedPlan = RoutingConfigFactory.createForMessageOrder(
      user1,
      'NHSAPP',
      { name: 'Deleted Plan', status: 'DELETED' }
    ).addTemplate('NHSAPP', templateId).dbEntry;

    await templateStorageHelper.seedTemplateData([template]);
    await routingConfigStorageHelper.seed([activePlan, deletedPlan]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configs-by-template-id/${templateId}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.statusCode).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data).toEqual([{ id: activePlan.id, name: 'Active Plan' }]);
    expect(body.data).not.toEqual(
      expect.arrayContaining([{ id: deletedPlan.id, name: 'Deleted Plan' }])
    );
  });
});
