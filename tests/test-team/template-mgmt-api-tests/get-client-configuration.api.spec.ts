import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { testClients } from '../helpers/client/client-helper';

test.describe('GET /v1/client-configuration', () => {
  const authHelper = createAuthHelper();
  let userWithClientConfig: TestUser;
  let userWithoutClientConfiguration: TestUser;

  const url = `${process.env.API_BASE_URL}/v1/client-configuration`;

  test.beforeAll(async () => {
    userWithClientConfig = await authHelper.getTestUser(testUsers.User1.userId);
    userWithoutClientConfiguration = await authHelper.getTestUser(
      testUsers.User4.userId
    );
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.get(url);

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if no configuration parameter exists for the user', async ({
    request,
  }) => {
    const response = await request.get(url, {
      headers: {
        Authorization: await userWithoutClientConfiguration.getAccessToken(),
      },
    });
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Client configuration is not available',
    });
  });

  test('returns 200 if client configuration exists for the user', async ({
    request,
  }) => {
    const response = await request.get(url, {
      headers: {
        Authorization: await userWithClientConfig.getAccessToken(),
      },
    });

    const client = await authHelper.getClient(userWithClientConfig.clientId);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      clientConfiguration: {
        campaignIds: client?.campaignIds,
        features: client?.features,
      },
    });
  });
});
