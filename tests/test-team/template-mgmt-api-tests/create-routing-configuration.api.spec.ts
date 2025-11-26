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
  let userSharedClient: TestUser;
  let userRoutingDisabled: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);
  });

  test.afterAll(async () => {
    await storageHelper.deleteAdHoc();
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

    storageHelper.addAdHocKey({
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
        defaultCascadeGroup: 'standard',
        name: payload.name,
        id: expect.stringMatching(uuidRegExp),
        status: 'DRAFT',
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(created.data.createdAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(created.data.createdAt).toEqual(created.data.updatedAt);
  });

  test('returns 201 if routing config input is valid - allows null templateIds', async ({
    request,
  }) => {
    const payload = RoutingConfigFactory.create(user1, {
      cascadeGroupOverrides: [
        { name: 'translations', language: ['ar'] },
        { name: 'accessible', accessibleFormat: ['x0'] },
      ],
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: null,
        },
        {
          cascadeGroups: ['accessible'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: null,
        },
        {
          cascadeGroups: ['translations'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: null,
        },
      ],
    }).apiPayload;

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

    storageHelper.addAdHocKey({
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
        defaultCascadeGroup: 'standard',
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

  test('returns 400 if campaignId is not available for the client', async ({
    request,
  }) => {
    const campaignId = 'not_a_client_campaign';

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
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

    storageHelper.addAdHocKey({
      id: created.data.id,
      clientId: user1.clientId,
    });

    expect(created.data.status).toEqual('DRAFT');
  });

  test('created routing config is accessible by a user belonging to the same client', async ({
    request,
  }) => {
    const payload = RoutingConfigFactory.create(user1).apiPayload;

    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: payload,
      }
    );

    expect(createResponse.status()).toBe(201);

    const created = await createResponse.json();

    storageHelper.addAdHocKey({
      id: created.data.id,
      clientId: user1.clientId,
    });

    expect(user1.clientId).toBe(userSharedClient.clientId);

    const getResponse = await request.get(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${created.data.id}`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
      }
    );

    expect(getResponse.status()).toBe(200);

    expect(await getResponse.json()).toEqual({
      statusCode: 200,
      data: created.data,
    });
  });

  test('returns 400 if routing feature is disabled on the client', async ({
    request,
  }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
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
});
