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

test.describe('PUT /v1/routing-configuration/:routingConfigId', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  let user1: TestUser;
  let userDifferentClient: TestUser;
  let userSharedClient: TestUser;
  let userRoutingDisabled: TestUser;
  let userMultiCampaign: TestUser;

  let routingConfigNoUpdates: FactoryRoutingConfig;
  let routingConfigSuccessfullyUpdate: FactoryRoutingConfig;
  let routingConfigCompleted: FactoryRoutingConfig;
  let routingConfigDeleted: FactoryRoutingConfig;
  let routingConfigSubmitBySharedClientUser: FactoryRoutingConfig;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userDifferentClient = await authHelper.getTestUser(
      testUsers.UserRoutingEnabled.userId
    );
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);
    userMultiCampaign = await authHelper.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );

    routingConfigNoUpdates = RoutingConfigFactory.create(user1);
    routingConfigSuccessfullyUpdate = RoutingConfigFactory.create(user1);

    routingConfigCompleted = RoutingConfigFactory.create(user1, {
      status: 'COMPLETED',
    });

    routingConfigDeleted = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    routingConfigSubmitBySharedClientUser = RoutingConfigFactory.create(user1);

    await storageHelper.seed([
      routingConfigNoUpdates.dbEntry,
      routingConfigSuccessfullyUpdate.dbEntry,
      routingConfigCompleted.dbEntry,
      routingConfigDeleted.dbEntry,
      routingConfigSubmitBySharedClientUser.dbEntry,
    ]);
  });

  test.afterAll(async () => {
    await storageHelper.deleteAdHoc();
    await storageHelper.deleteSeeded();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if routing config does not exist', async ({ request }) => {
    const response = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/noexist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: routingConfigNoUpdates.apiPayload,
      }
    );
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing configuration not found',
    });
  });

  test('returns 404 if routing config exists but is owned by a different client', async ({
    request,
  }) => {
    const { apiPayload, dbEntry } =
      RoutingConfigFactory.create(userDifferentClient);

    const updateResponse = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
        },
        data: apiPayload,
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

    const update = {
      ...routingConfigSuccessfullyUpdate.apiPayload,
      name: 'new name',
    };

    const updateResponse = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSuccessfullyUpdate.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: update,
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfigSuccessfullyUpdate.apiResponse,
        ...update,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(updated.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(updated.data.createdAt).toEqual(
      routingConfigSuccessfullyUpdate.dbEntry.createdAt
    );
  });

  test('returns 400 - cannot update a COMPLETED routing config', async ({
    request,
  }) => {
    const response = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigCompleted.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: {
          ...routingConfigCompleted.apiPayload,
          name: 'new name',
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage:
        'Routing configuration with status COMPLETED cannot be updated',
    });
  });

  test('returns 400 if campaignId is not available for the client', async ({
    request,
  }) => {
    const campaignId = 'not_a_client_campaign';

    const response = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigNoUpdates.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: RoutingConfigFactory.create(user1, {
          campaignId,
        }).apiPayload,
      }
    );

    const dbgClientCampaigns = JSON.stringify(user1.campaignIds);
    expect(user1.campaignIds?.includes(campaignId), dbgClientCampaigns).toBe(
      false
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Invalid campaign ID in request',
    });
  });

  test('returns 404 - cannot update a DELETED routing config', async ({
    request,
  }) => {
    const failedSubmitResponse = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigDeleted.dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: {
          ...routingConfigDeleted.apiPayload,
          name: 'new name',
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

  test('user belonging to the same client as the creator can update', async ({
    request,
  }) => {
    const update = {
      ...routingConfigSuccessfullyUpdate.apiPayload,
      name: 'new name',
    };

    const updateResponse = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSubmitBySharedClientUser.dbEntry.id}`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
        data: update,
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(user1.clientId).toBe(userSharedClient.clientId);

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfigSubmitBySharedClientUser.apiResponse,
        ...update,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });
  });

  test('returns 400 if routing feature is disabled on the client', async ({
    request,
  }) => {
    const response = await request.put(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config`,
      {
        headers: {
          Authorization: await userRoutingDisabled.getAccessToken(),
        },
        data: RoutingConfigFactory.create(userRoutingDisabled).apiPayload,
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Routing feature is disabled',
    });
  });

  test.describe('partial updates', () => {
    test('name only - returns 200 and the updated routing config data', async ({
      request,
    }) => {
      const routingConfig = RoutingConfigFactory.create(user1);

      await storageHelper.seed([routingConfig.dbEntry]);

      const update = {
        name: 'new name',
      };

      const start = new Date();

      const updateResponse = await request.put(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: update,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          ...routingConfig.apiResponse,
          ...update,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(routingConfig.dbEntry.createdAt);
    });

    test('campaignId only - returns 200 and the updated routing config data', async ({
      request,
    }) => {
      const routingConfig = RoutingConfigFactory.create(userMultiCampaign);

      await storageHelper.seed([routingConfig.dbEntry]);

      const update = {
        campaignId: userMultiCampaign.campaignIds?.[1],
      };
      const start = new Date();

      const updateResponse = await request.put(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
        {
          headers: {
            Authorization: await userMultiCampaign.getAccessToken(),
          },
          data: update,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          ...routingConfig.apiResponse,
          ...update,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(routingConfig.dbEntry.createdAt);
    });

    test('cascade and cascadeGroupOverrides - returns 200 and the updated routing config data', async ({
      request,
    }) => {
      const routingConfig = RoutingConfigFactory.create(user1);

      await storageHelper.seed([routingConfig.dbEntry]);

      const update = {
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'EMAIL',
            channelType: 'primary',
            defaultTemplateId: null,
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      };

      const start = new Date();

      const updateResponse = await request.put(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: update,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          ...routingConfig.apiResponse,
          ...update,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(routingConfig.dbEntry.createdAt);
    });

    test('cascade without cascadeGroupOverrides - returns 400', async ({
      request,
    }) => {
      const routingConfig = RoutingConfigFactory.create(user1);

      await storageHelper.seed([routingConfig.dbEntry]);

      const update = {
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'EMAIL',
            channelType: 'primary',
            defaultTemplateId: null,
          },
        ],
      };

      const updateResponse = await request.put(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: update,
        }
      );

      expect(updateResponse.status()).toBe(400);

      const response = await updateResponse.json();

      expect(response).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          cascade:
            'cascade and cascadeGroupOverrides must either both be present or both be absent.',
        },
      });
    });

    test('cascadeGroupOverrides without cascade - returns 400', async ({
      request,
    }) => {
      const routingConfig = RoutingConfigFactory.create(user1);

      await storageHelper.seed([routingConfig.dbEntry]);

      const update = {
        cascadeGroupOverrides: [{ name: 'standard' }],
      };

      const response = await request.put(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: update,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          cascadeGroupOverrides:
            'cascade and cascadeGroupOverrides must either both be present or both be absent.',
        },
      });
    });

    test('empty payload - returns 400', async ({ request }) => {
      const routingConfig = RoutingConfigFactory.create(user1);

      await storageHelper.seed([routingConfig.dbEntry]);

      const update = {};

      const response = await request.put(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: update,
        }
      );

      expect(response.status()).toBe(400);

      expect(await response.json()).toEqual({
        statusCode: 400,
        technicalMessage: 'Request failed validation',
        details: {
          $root: 'At least one field must be provided.',
        },
      });
    });
  });
});
