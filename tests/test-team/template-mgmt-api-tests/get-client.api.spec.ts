import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { testClients } from '../helpers/client/client-helper';

test.describe('GET /v1/client-configuration', () => {
  const authHelper = createAuthHelper();
  let userWithClient: TestUser;
  let userWithoutClient: TestUser;

  const url = `${process.env.API_BASE_URL}/v1/client-configuration`;

  test.beforeAll(async () => {
    userWithClient = await authHelper.getTestUser(testUsers.User1.userId);
    userWithoutClient = await authHelper.getTestUser(testUsers.User6.userId);
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.get(url);

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 400 if no client is configured for the user', async ({
    request,
  }) => {
    const response = await request.get(url, {
      headers: {
        Authorization: await userWithoutClient.getAccessToken(),
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Invalid request',
    });
  });

  test('returns 200 if client exists for the user', async ({ request }) => {
    const response = await request.get(url, {
      headers: {
        Authorization: await userWithClient.getAccessToken(),
      },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      campaignId: testClients[userWithClient.clientKey!].campaignId,
      features: testClients[userWithClient.clientKey!].features,
    });
  });
});
