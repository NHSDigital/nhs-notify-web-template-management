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

function createTemplates(user: TestUser) {
  const templateIds = {
    NHSAPP: randomUUID(),
    EMAIL: randomUUID(),
    LETTER: randomUUID(),
  };

  return {
    NHSAPP: TemplateFactory.createNhsAppTemplate(
      templateIds.NHSAPP,
      user,
      `Event NHS App Template - ${templateIds.NHSAPP}`,
      'NOT_YET_SUBMITTED'
    ),
    EMAIL: TemplateFactory.createEmailTemplate(
      templateIds.EMAIL,
      user,
      `Event Email Template - ${templateIds.EMAIL}`,
      'SUBMITTED'
    ),
    LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.LETTER,
      user,
      `Event Letter Template - ${templateIds.LETTER}`,
      'PROOF_APPROVED'
    ),
  };
}

test.describe('Event publishing - Routing Config', () => {
  const authHelper = createAuthHelper();
  const routingConfigStorageHelper = new RoutingConfigStorageHelper();
  const templateStorageHelper = new TemplateStorageHelper();

  let user: TestUser;

  test.beforeAll(async () => {
    user = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
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

    routingConfigStorageHelper.addAdHocKey({
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

    routingConfigStorageHelper.addAdHocKey({
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
    const templates = createTemplates(user);
    const seedStart = new Date();
    await templateStorageHelper.seedTemplateData(Object.values(templates));

    // Wait for seeding events to arrive before proceeding
    await expect(async () => {
      const seedEvents = await eventSubscriber.receive({
        since: seedStart,
        // Authoring letters don't produce events yet
        match: eventWithIdIn([templates.NHSAPP.id, templates.EMAIL.id]),
      });
      expect(seedEvents.length).toBe(2);
    }).toPass({ timeout: 60_000 });

    const start = new Date();

    const payload = RoutingConfigFactory.create(user, {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: templates.NHSAPP.id,
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: templates.EMAIL.id,
        },
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: templates.LETTER.id,
        },
      ],
    }).apiPayload;

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
      data: { id: routingConfigId, lockNumber },
    } = await createResponse.json();

    routingConfigStorageHelper.addAdHocKey({
      id: routingConfigId,
      clientId: user.clientId,
    });

    const submitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigId}/submit`,
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
        match: eventWithIdIn([
          routingConfigId,
          templates.EMAIL.id,
          templates.NHSAPP.id,
          templates.LETTER.id,
        ]),
      });

      expect(events).toHaveLength(3);

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigDrafted.v1',
            data: expect.objectContaining({
              id: routingConfigId,
            }),
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.RoutingConfigCompleted.v1',
            data: expect.objectContaining({
              id: routingConfigId,
            }),
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
            data: expect.objectContaining({
              id: templates.NHSAPP.id,
            }),
          }),
        })
      );

      // This was already submitted
      expect(events).not.toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
            data: expect.objectContaining({
              id: templates.EMAIL.id,
            }),
          }),
        })
      );

      // AUTHORING letters don't produce events yet
      expect(events).not.toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
            data: expect.objectContaining({
              id: templates.LETTER.id,
            }),
          }),
        })
      );
    }).toPass({ timeout: 60_000 });
  });
});
