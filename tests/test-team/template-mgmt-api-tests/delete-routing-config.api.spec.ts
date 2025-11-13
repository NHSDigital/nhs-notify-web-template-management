import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import type { FactoryRoutingConfig } from '../helpers/types';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';

test.describe('DELETE /v1/routing-configuration/:routingConfigId', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  let user1: TestUser;
  let userDifferentClient: TestUser;
  let userSharedClient: TestUser;
  let userRoutingDisabled: TestUser;

  let routingConfigNoUpdates: FactoryRoutingConfig;
  let routingConfigSuccessfullyDelete: FactoryRoutingConfig;
  let routingConfigSubmitted: FactoryRoutingConfig;
  let routingConfigAlreadyDeleted: FactoryRoutingConfig;
  let routingConfigDeleteBySharedClientUser: FactoryRoutingConfig;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userDifferentClient = await authHelper.getTestUser(
      testUsers.UserRoutingEnabled.userId
    );
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);

    routingConfigNoUpdates = RoutingConfigFactory.create(user1);
    routingConfigSuccessfullyDelete = RoutingConfigFactory.create(user1);

    routingConfigSubmitted = RoutingConfigFactory.create(user1, {
      status: 'COMPLETED',
    });

    routingConfigAlreadyDeleted = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    routingConfigDeleteBySharedClientUser = RoutingConfigFactory.create(user1);

    await storageHelper.seed([
      routingConfigNoUpdates.dbEntry,
      routingConfigSuccessfullyDelete.dbEntry,
      routingConfigSubmitted.dbEntry,
      routingConfigAlreadyDeleted.dbEntry,
      routingConfigDeleteBySharedClientUser.dbEntry,
    ]);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if routing config does not exist', async ({ request }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/noexist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing Config not found',
    });
  });

  test('returns 404 if routing config exists but is owned by a different client', async ({
    request,
  }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigNoUpdates.dbEntry.id}`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing Config not found',
    });
  });

  test('returns 204 no content on successful deletion', async ({ request }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSuccessfullyDelete.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(204);
  });

  test('returns 400 - cannot delete a COMPLETED routing config', async ({
    request,
  }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSubmitted.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    const updateResponseBody = await response.json();

    expect(updateResponseBody).toEqual({
      statusCode: 400,
      technicalMessage:
        'Routing Config with status COMPLETED cannot be updated',
    });
  });

  test('returns 404 - cannot delete an already DELETED routing config', async ({
    request,
  }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigAlreadyDeleted.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(404);

    const updateResponseBody = await response.json();

    expect(updateResponseBody).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing Config not found',
    });
  });

  test('user belonging to the same client as the creator can delete', async ({
    request,
  }) => {
    expect(user1.clientId).toBe(userSharedClient.clientId);

    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigDeleteBySharedClientUser.dbEntry.id}`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(204);
  });

  test('returns 400 if routing feature is disabled on the client', async ({
    request,
  }) => {
    const response = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config`,
      {
        headers: {
          Authorization: await userRoutingDisabled.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Routing feature is disabled',
    });
  });
});
