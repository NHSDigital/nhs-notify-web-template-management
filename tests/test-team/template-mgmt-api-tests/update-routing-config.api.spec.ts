import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';

test.describe('PATCH /v1/routing-configuration/:routingConfigId', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  let user1: TestUser;
  let userDifferentClient: TestUser;
  let userSharedClient: TestUser;
  let userRoutingDisabled: TestUser;
  let userMultiCampaign: TestUser;

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
  });

  test.afterAll(async () => {
    await storageHelper.deleteAdHoc();
    await storageHelper.deleteSeeded();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config`,
      { headers: { 'X-Lock-Number': '0' } }
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if routing config does not exist', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/no-exist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': '0',
        },
        data: {
          name: 'foo',
        },
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
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
        data: {
          name: 'new-name',
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
    const { dbEntry, apiResponse } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const start = new Date();

    const update = {
      name: 'new name',
    };

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
        data: update,
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...apiResponse,
        ...update,
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: dbEntry.lockNumber + 1,
      },
    });

    expect(updated.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(updated.data.createdAt).toEqual(dbEntry.createdAt);
  });

  test('returns 400 - cannot update a COMPLETED routing config', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1, {
      status: 'COMPLETED',
    });

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
        data: {
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
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const campaignId = 'not_a_client_campaign';

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
        data: {
          campaignId,
        },
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
    const { dbEntry } = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    await storageHelper.seed([dbEntry]);

    const failedSubmitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
        data: {
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
    const { dbEntry, apiResponse } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const update = {
      name: 'new name',
    };

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
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
        ...apiResponse,
        ...update,
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: dbEntry.lockNumber + 1,
      },
    });
  });

  test('returns 400 if routing feature is disabled on the client', async ({
    request,
  }) => {
    const { dbEntry, apiPayload } =
      RoutingConfigFactory.create(userRoutingDisabled);

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await userRoutingDisabled.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
        data: apiPayload,
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
      const { dbEntry, apiResponse } = RoutingConfigFactory.create(user1);

      await storageHelper.seed([dbEntry]);

      const update = {
        name: 'new name',
      };

      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
          },
          data: update,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          ...apiResponse,
          ...update,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: dbEntry.lockNumber + 1,
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(dbEntry.createdAt);
    });

    test('campaignId only - returns 200 and the updated routing config data', async ({
      request,
    }) => {
      const { dbEntry, apiResponse } =
        RoutingConfigFactory.create(userMultiCampaign);

      await storageHelper.seed([dbEntry]);

      const update = {
        campaignId: userMultiCampaign.campaignIds?.[1],
      };
      const start = new Date();

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
        {
          headers: {
            Authorization: await userMultiCampaign.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
          },
          data: update,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          ...apiResponse,
          ...update,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: dbEntry.lockNumber + 1,
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(dbEntry.createdAt);
    });

    test('cascade and cascadeGroupOverrides - returns 200 and the updated routing config data', async ({
      request,
    }) => {
      const { dbEntry, apiResponse } = RoutingConfigFactory.create(user1);

      await storageHelper.seed([dbEntry]);

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

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
          },
          data: update,
        }
      );

      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();

      expect(updated).toEqual({
        statusCode: 200,
        data: {
          ...apiResponse,
          ...update,
          updatedAt: expect.stringMatching(isoDateRegExp),
          lockNumber: dbEntry.lockNumber + 1,
        },
      });

      expect(updated.data.updatedAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(updated.data.createdAt).toEqual(dbEntry.createdAt);
    });

    test('cascade without cascadeGroupOverrides - returns 400', async ({
      request,
    }) => {
      const { dbEntry } = RoutingConfigFactory.create(user1);

      await storageHelper.seed([dbEntry]);

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

      const updateResponse = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
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
      const { dbEntry } = RoutingConfigFactory.create(user1);

      await storageHelper.seed([dbEntry]);

      const update = {
        cascadeGroupOverrides: [{ name: 'standard' }],
      };

      const response = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
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
      const { dbEntry } = RoutingConfigFactory.create(user1);

      await storageHelper.seed([dbEntry]);

      const update = {};

      const response = await request.patch(
        `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
            'X-Lock-Number': String(dbEntry.lockNumber),
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

  test('returns 409 if the lock number header is not set', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: {
          name: 'new name',
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

  test('returns 409 if the lock number header does not match the current one', async ({
    request,
  }) => {
    const { dbEntry } = RoutingConfigFactory.create(user1);

    await storageHelper.seed([dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber + 1),
        },
        data: {
          name: 'new name',
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
});
