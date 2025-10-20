import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { EventCacheHelper } from '../helpers/events/event-cache-helper';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';

test.describe('Event publishing - Routing Config', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  const eventCacheHelper = new EventCacheHelper();

  let user: TestUser;

  test.beforeAll(async () => {
    user = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
  });

  test('Expect no events', async ({ request }) => {
    const id = randomUUID();

    const start = new Date();

    await storageHelper.seed([
      RoutingConfigFactory.create(user, { id }).dbEntry,
    ]);

    const submittedResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${id}/submit`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
        },
      }
    );

    expect(submittedResponse.status()).toBe(200);

    // Note: not ideal - but we are expecting 0 events and there can be a delay
    // in events arriving. We should wait for a moment
    // 5 seconds seems to largest delay when testing locally
    await setTimeout(5000);

    // This would throw if a routing config event was present,
    // EventCacheHelper doesn't yet know how to handle routing config events
    const events = await eventCacheHelper.findEvents(start, [id]);

    expect(events).toHaveLength(0);
  });
});
