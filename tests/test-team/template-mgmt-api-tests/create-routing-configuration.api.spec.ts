import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import {
  isoDateRegExp,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';

test.describe('POST /v1/routing-configuration', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await storageHelper.deleteAdHocRoutingConfigs();
  });

  test('returns 201 if routing config input is valid', async ({ request }) => {
    const payload = RoutingConfigFactory.create(user1).apiPayload;

    const start = new Date();

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: payload,
      }
    );

    expect(response.status()).toBe(201);

    const created = await response.json();

    storageHelper.addAdHocRoutingConfigKey({
      id: created.data.id,
      clientId: user1.clientId,
    });

    expect(created).toEqual({
      statusCode: 201,
      data: {
        clientId: user1.clientId,
        campaignId: payload.campaignId,
        cascade: payload.cascade,
        cascadeGroupOverrides: payload.cascadeGroupOverrides,
        createdAt: expect.stringMatching(isoDateRegExp),
        name: payload.name,
        id: expect.stringMatching(uuidRegExp),
        status: 'DRAFT',
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(created.data.createdAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(created.data.createdAt).toEqual(created.data.updatedAt);
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 400 if no body on request', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        campaignId: 'Invalid input: expected string, received undefined',
        cascade: 'Invalid input: expected array, received undefined',
        cascadeGroupOverrides:
          'Invalid input: expected array, received undefined',
        name: 'Invalid input: expected string, received undefined',
      },
    });
  });

  test('returns 400 if routing config has invalid field (name)', async ({
    request,
  }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: RoutingConfigFactory.create(user1, {
          name: 700 as unknown as string,
        }).apiPayload,
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        name: 'Invalid input: expected string, received number',
      },
    });
  });

  test('ignores status if given - routing config cannot be completed at create time', async ({
    request,
  }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: RoutingConfigFactory.create(user1, {
          status: 'COMPLETED',
        }).apiPayload,
      }
    );

    expect(response.status()).toBe(201);

    const created = await response.json();

    storageHelper.addAdHocRoutingConfigKey({
      id: created.data.id,
      clientId: user1.clientId,
    });

    expect(created.data.status).toEqual('DRAFT');
  });
});
