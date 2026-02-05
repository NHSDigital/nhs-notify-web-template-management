import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { EventCacheHelper } from '../helpers/events/event-cache-helper';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';

test.describe('Event publishing - Routing Config', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const eventCacheHelper = new EventCacheHelper();

  let user: TestUser;

  test.beforeAll(async () => {
    user = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('Expect a draft event and a deleted event when some template IDs are null', async ({
    request,
  }) => {
    const payload = RoutingConfigFactory.create(user, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: null,
        },
      ],
    }).apiPayload;

    const start = new Date();

    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
        },
        data: payload,
      }
    );

    expect(createResponse.status()).toBe(201);

    const {
      data: { id, lockNumber },
    } = await createResponse.json();

    storageHelper.addAdHocKey({
      id,
      clientId: user.clientId,
    });

    const deleteResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${id}`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    expect(deleteResponse.status()).toBe(204);

    await expect(async () => {
      const events = await eventCacheHelper.findEvents(start, [id]);

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
          data: expect.objectContaining({
            id,
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.RoutingConfigDeleted.v1',
          data: expect.objectContaining({
            id,
          }),
        })
      );

      expect(events).toHaveLength(2);
    }).toPass({ timeout: 60_000 });
  });

  test('Expect a draft event and a deleted event', async ({ request }) => {
    const payload = RoutingConfigFactory.create(user, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: 'b1854a33-fc1b-4e7d-99d0-6f7b92b8c530',
        },
      ],
    }).apiPayload;

    const start = new Date();

    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
        },
        data: payload,
      }
    );

    expect(createResponse.status()).toBe(201);

    const {
      data: { id, lockNumber },
    } = await createResponse.json();

    storageHelper.addAdHocKey({
      id,
      clientId: user.clientId,
    });

    const deleteResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${id}`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    expect(deleteResponse.status()).toBe(204);

    await expect(async () => {
      const events = await eventCacheHelper.findEvents(start, [id]);

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
          data: expect.objectContaining({
            id,
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.RoutingConfigDeleted.v1',
          data: expect.objectContaining({
            id,
          }),
        })
      );

      expect(events).toHaveLength(2);
    }).toPass({ timeout: 60_000 });
  });

  test('Expect routing config and template completed events on submit', async ({
    request,
  }) => {
    const nhsAppTemplateId = randomUUID();
    const emailTemplateId = randomUUID();

    // NHS App template - NOT_YET_SUBMITTED, should trigger TemplateCompleted.v1
    const nhsAppTemplate = TemplateFactory.createNhsAppTemplate(
      nhsAppTemplateId,
      user,
      'NHS App Template for Submit'
    );
    nhsAppTemplate.templateStatus = 'NOT_YET_SUBMITTED';

    // Email template - already SUBMITTED, should NOT trigger TemplateCompleted.v1
    const emailTemplate = TemplateFactory.createEmailTemplate(
      emailTemplateId,
      user,
      'Email Template for Submit'
    );
    emailTemplate.templateStatus = 'SUBMITTED';

    await templateStorageHelper.seedTemplateData([nhsAppTemplate, emailTemplate]);

    // Wait for DynamoDB stream events from seeding to be processed
    // This ensures any events triggered by seeding have timestamps before 'start'
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const payload = RoutingConfigFactory.create(user, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: nhsAppTemplateId,
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: emailTemplateId,
        },
      ],
    }).apiPayload;

    const start = new Date();

    const createResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/routing-configuration`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
        },
        data: payload,
      }
    );

    expect(createResponse.status()).toBe(201);

    const {
      data: { id, lockNumber },
    } = await createResponse.json();

    storageHelper.addAdHocKey({
      id,
      clientId: user.clientId,
    });

    const submitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${id}/submit`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
          'X-Lock-Number': String(lockNumber),
        },
      }
    );

    expect(submitResponse.status()).toBe(200);

    await expect(async () => {
      const events = await eventCacheHelper.findEvents(start, [
        id,
        nhsAppTemplateId,
        emailTemplateId,
      ]);

      // Routing config events
      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
          data: expect.objectContaining({
            id,
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.RoutingConfigCompleted.v1',
          data: expect.objectContaining({
            id,
          }),
        })
      );

      // Template completed events - NHS App (was NOT_YET_SUBMITTED)
      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
          data: expect.objectContaining({
            id: nhsAppTemplateId,
          }),
        })
      );

      // Email template should NOT have a TemplateCompleted event (was already SUBMITTED)
      expect(events).not.toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
          data: expect.objectContaining({
            id: emailTemplateId,
          }),
        })
      );

      // Total: 2 routing config events + 1 template completed event = 3
      expect(events).toHaveLength(3);
    }).toPass({ timeout: 60_000 });
  });
});
