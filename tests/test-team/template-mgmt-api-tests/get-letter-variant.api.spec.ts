import { test, expect } from '@playwright/test';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';

test.describe('GET /v1/letter-variant/:id', () => {
  const context = getTestContext();
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await context.auth.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );
    user2 = await context.auth.getTestUser(testUsers.User2.userId);
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const [variant] = await context.letterVariants.getGlobalLetterVariants();

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/letter-variant/${variant.id}`
    );

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test("returns 404 if variant doesn't exist", async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/letter-variant/no-exist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Letter Variant not found',
    });
  });

  test('returns 200 for global variant', async ({ request }) => {
    const [variant] = await context.letterVariants.getGlobalLetterVariants();

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/letter-variant/${variant.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: variant,
    });
  });

  test('returns 200 for client variant', async ({ request }) => {
    const [variant] =
      await context.letterVariants.getClientScopedLetterVariants(
        user1.clientId
      );

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/letter-variant/${variant.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: variant,
    });
  });

  test('returns 200 for campaign variant', async ({ request }) => {
    const [campaignId] = user1.campaignIds!;
    const [variant] =
      await context.letterVariants.getCampaignScopedLetterVariants(
        user1.clientId,
        campaignId
      );

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/letter-variant/${variant.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: variant,
    });
  });

  test('returns 404 for client variant owned by another client', async ({
    request,
  }) => {
    const [variant] =
      await context.letterVariants.getClientScopedLetterVariants(
        user1.clientId
      );

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/letter-variant/${variant.id}`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Letter Variant not found',
    });
  });

  test('returns 404 for campaign variant owned by another client', async ({
    request,
  }) => {
    const [campaignId] = user1.campaignIds!;
    const [variant] =
      await context.letterVariants.getCampaignScopedLetterVariants(
        user1.clientId,
        campaignId
      );

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/letter-variant/${variant.id}`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Letter Variant not found',
    });
  });
});
