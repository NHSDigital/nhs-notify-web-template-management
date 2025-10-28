import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import type { FactoryRoutingConfig } from '../helpers/types';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import { RoutingConfigStatus } from 'nhs-notify-backend-client';

test.describe('PATCH /v1/routing-configuration/:routingConfigId/submit', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  let user1: TestUser;
  let userDifferentClient: TestUser;
  let userSharedClient: TestUser;
  let userRoutingDisabled: TestUser;

  let routingConfigNoUpdates: FactoryRoutingConfig;
  let routingConfigSuccessfullySubmit: FactoryRoutingConfig;
  let routingConfigAlreadySubmitted: FactoryRoutingConfig;
  let routingConfigDeleted: FactoryRoutingConfig;
  let routingConfigSubmitBySharedClientUser: FactoryRoutingConfig;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userDifferentClient = await authHelper.getTestUser(
      testUsers.UserRoutingEnabled.userId
    );
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);

    routingConfigNoUpdates = RoutingConfigFactory.create(user1);
    routingConfigSuccessfullySubmit = RoutingConfigFactory.create(user1);

    routingConfigAlreadySubmitted = RoutingConfigFactory.create(user1, {
      status: 'COMPLETED',
    });

    routingConfigDeleted = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    routingConfigSubmitBySharedClientUser = RoutingConfigFactory.create(user1);

    await storageHelper.seed([
      routingConfigNoUpdates.dbEntry,
      routingConfigSuccessfullySubmit.dbEntry,
      routingConfigAlreadySubmitted.dbEntry,
      routingConfigDeleted.dbEntry,
      routingConfigSubmitBySharedClientUser.dbEntry,
    ]);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config/submit`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if routing config does not exist', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/noexist/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
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
    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigNoUpdates.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
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
    const start = new Date();

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSuccessfullySubmit.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfigSuccessfullySubmit.apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(updated.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(updated.data.createdAt).toEqual(
      routingConfigSuccessfullySubmit.dbEntry.createdAt
    );
  });

  test('returns 400 - cannot submit a COMPLETED routing config', async ({
    request,
  }) => {
    const failedSubmitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigAlreadySubmitted.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
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
    const failedSubmitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigDeleted.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
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
    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSubmitBySharedClientUser.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(user1.clientId).toBe(userSharedClient.clientId);

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfigSubmitBySharedClientUser.apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });
  });

  test('returns 400 if routing feature is disabled on the client', async ({
    request,
  }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config/submit`,
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
