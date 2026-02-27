import { test, expect } from '@playwright/test';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import type { FactoryRoutingConfig } from 'helpers/types';
import { getTestContext } from 'helpers/context/context';

test.describe('GET /v1/routing-configurations/count', () => {
  const context = getTestContext();
  const storageHelper = new RoutingConfigStorageHelper();
  let user1: TestUser;
  let user2: TestUser;
  let userSharedClient: TestUser;
  let draftRoutingConfig: FactoryRoutingConfig;
  let completedRoutingConfig: FactoryRoutingConfig;
  let deletedRoutingConfig: FactoryRoutingConfig;

  test.beforeAll(async () => {
    user1 = await context.auth.getTestUser(testUsers.User1.userId);
    user2 = await context.auth.getTestUser(testUsers.User2.userId);
    userSharedClient = await context.auth.getTestUser(testUsers.User7.userId);

    draftRoutingConfig = RoutingConfigFactory.create(user1);

    completedRoutingConfig = RoutingConfigFactory.create(user1, {
      status: 'COMPLETED',
    });

    deletedRoutingConfig = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    await storageHelper.seed([
      draftRoutingConfig.dbEntry,
      completedRoutingConfig.dbEntry,
      deletedRoutingConfig.dbEntry,
    ]);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configurations/count`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('counts active routing configs belonging to the authenticated owner', async ({
    request,
  }) => {
    // exercise - request user 1 routing configs
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configurations/count`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    //  assert on user 1 response - should filter out deleted
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 200,
      data: { count: 2 },
    });
  });

  test('does not return routing configs belonging to other clients besides the authenticated one', async ({
    request,
  }) => {
    // exercise - request user 2 routing configs (they have no routing configs)
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configurations/count`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    // assert that user 2 gets an empty list
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 200,
      data: { count: 0 },
    });
  });

  test('different users on the same client can fetch the clients routing configs', async ({
    request,
  }) => {
    // exercise - request shared user routing configs (same client as user 1)
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configurations/count`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
      }
    );

    // assert that the user gets the full list of configs belonging to their client
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 200,
      data: { count: 2 },
    });
  });

  test('can filter by DRAFT status', async ({ request }) => {
    // exercise - request routing configs with DRAFT status
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configurations/count`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        params: { status: 'DRAFT' },
      }
    );

    // assert that response only contains the drafts
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 200,
      data: { count: 1 },
    });
  });

  test('can filter by COMPLETED status', async ({ request }) => {
    // exercise - request routing configs with COMPLETED status
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configurations/count`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        params: { status: 'COMPLETED' },
      }
    );

    // assert that response only contains the completed configs
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 200,
      data: { count: 1 },
    });
  });

  test('cannot filter by DELETED status', async ({ request }) => {
    // exercise - request routing configs with DELETED status
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configurations/count`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        params: { status: 'DELETED' },
      }
    );

    // assert that response contains an error
    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body).toEqual({
      details: {
        status: 'Invalid option: expected one of "COMPLETED"|"DRAFT"',
      },
      statusCode: 400,
      technicalMessage: 'Request failed validation',
    });
  });
});
