import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import type { FactoryRoutingConfig } from 'helpers/types';

test.describe('GET /v1/routing-configuration/:routingConfigId', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  let user1: TestUser;
  let user2: TestUser;
  let userSharedClient: TestUser;
  let routingConfig: FactoryRoutingConfig;
  let deletedRoutingConfig: FactoryRoutingConfig;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    user2 = await authHelper.getTestUser(testUsers.User2.userId);
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);

    routingConfig = RoutingConfigFactory.create(user1);

    deletedRoutingConfig = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    await storageHelper.seed([
      routingConfig.dbEntry,
      deletedRoutingConfig.dbEntry,
    ]);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 200 if routing config exists and authenticated user belongs to owning client', async ({
    request,
  }) => {
    // exercise: make the GET request to retrieve the routing config
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    // assert
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: routingConfig.apiResponse,
    });
  });

  test('returns 404 if routing config does not exist', async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${randomUUID()}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing configuration not found',
    });
  });

  test('returns 404 if routing config exists but the authenticated user belongs to a different client', async ({
    request,
  }) => {
    // exercise: make the GET request to retrieve the routing config as user2
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    // assert
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing configuration not found',
    });
  });

  test('returns 404 if routing config has been deleted', async ({
    request,
  }) => {
    // exercise: make the GET request to retrieve the deleted routing config
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${deletedRoutingConfig.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    // assert
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing configuration not found',
    });
  });

  test('user belonging to the same client as the creator can get routing config', async ({
    request,
  }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: routingConfig.apiResponse,
    });
  });
});
