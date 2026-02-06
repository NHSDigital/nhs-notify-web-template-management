import { randomUUID } from 'node:crypto';
import {
  templateManagementEventSubscriber as test,
  expect,
} from '../fixtures/template-management-event-subscriber';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { eventWithId, eventWithIdIn } from '../helpers/events/matchers';

test.describe('Event publishing - Routing Config', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  const templateStorageHelper = new TemplateStorageHelper();

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
    eventSubscriber,
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
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(id),
      });

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
            data: expect.objectContaining({
              id,
            }),
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigDeleted.v1',
            data: expect.objectContaining({
              id,
            }),
          }),
        })
      );

      expect(events).toHaveLength(2);
    }).toPass({ timeout: 60_000 });
  });

  test('Expect a draft event and a deleted event', async ({
    request,
    eventSubscriber,
  }) => {
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
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(id),
      });

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
            data: expect.objectContaining({
              id,
            }),
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigDeleted.v1',
            data: expect.objectContaining({
              id,
            }),
          }),
        })
      );

      expect(events).toHaveLength(2);
    }).toPass({ timeout: 60_000 });
  });

  test('Expect routing config and template completed events on submit', async ({
    request,
    eventSubscriber,
  }) => {
    const nhsAppTemplateId = randomUUID();
    const emailTemplateId = randomUUID();

    const nhsAppTemplate = TemplateFactory.createNhsAppTemplate(
      nhsAppTemplateId,
      user,
      'NHS App Template for Submit'
    );
    nhsAppTemplate.templateStatus = 'NOT_YET_SUBMITTED';

    const emailTemplate = TemplateFactory.createEmailTemplate(
      emailTemplateId,
      user,
      'Email Template for Submit'
    );
    emailTemplate.templateStatus = 'SUBMITTED';

    const seedStart = new Date();

    await templateStorageHelper.seedTemplateData([
      nhsAppTemplate,
      emailTemplate,
    ]);

    await expect(async () => {
      const seedEvents = await eventSubscriber.receive({
        since: seedStart,
        match: eventWithIdIn([nhsAppTemplateId, emailTemplateId]),
      });
      expect(seedEvents).toHaveLength(2);
    }).toPass({ timeout: 60_000 });

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
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithIdIn([id, nhsAppTemplateId, emailTemplateId]),
      });

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
            data: expect.objectContaining({
              id,
            }),
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigCompleted.v1',
            data: expect.objectContaining({
              id,
            }),
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
            data: expect.objectContaining({
              id: nhsAppTemplateId,
            }),
          }),
        })
      );

      expect(events).not.toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
            data: expect.objectContaining({
              id: emailTemplateId,
            }),
          }),
        })
      );

      expect(events).toHaveLength(3);
    }).toPass({ timeout: 60_000 });
  });
});
