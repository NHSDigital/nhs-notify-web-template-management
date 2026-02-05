import {
  testWithEventSubscriber as test,
  expect,
} from '../fixtures/event-subscriber.fixture';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { eventWithId } from '../helpers/events/matchers';

const DIGITAL_CHANNELS = ['NHS_APP', 'SMS', 'EMAIL'] as const;

test.describe('Event publishing - Digital', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();

  let userRoutingEnabled: TestUser;
  let userRoutingDisabled: TestUser;

  test.beforeAll(async () => {
    userRoutingEnabled = await authHelper.getTestUser(testUsers.User1.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  for (const digitalChannel of DIGITAL_CHANNELS) {
    test.describe(`${digitalChannel} template events`, () => {
      test('Expect Draft.v1 event When Creating And Updating templates And Completed.v1 event When submitting templates (routing disabled)', async ({
        request,
        eventSubscriber,
      }) => {
        const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: digitalChannel,
        });

        const start = new Date();

        const createResponse = await request.post(
          `${process.env.API_BASE_URL}/v1/template`,
          {
            headers: {
              Authorization: await userRoutingDisabled.getAccessToken(),
            },
            data: template,
          }
        );

        expect(createResponse.status()).toBe(201);

        const {
          data: { id: templateId, name, lockNumber },
        } = await createResponse.json();

        templateStorageHelper.addAdHocTemplateKey({
          templateId,
          clientId: userRoutingDisabled.clientId,
        });

        const updateResponse = await request.put(
          `${process.env.API_BASE_URL}/v1/template/${templateId}`,
          {
            headers: {
              Authorization: await userRoutingDisabled.getAccessToken(),
              'X-Lock-Number': String(lockNumber),
            },
            data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
              templateType: digitalChannel,
              name: 'UPDATED',
            }),
          }
        );

        expect(updateResponse.status()).toBe(200);

        const updated = await updateResponse.json();

        const submitResponse = await request.patch(
          `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
          {
            headers: {
              Authorization: await userRoutingDisabled.getAccessToken(),
              'X-Lock-Number': String(updated.data.lockNumber),
            },
          }
        );

        expect(submitResponse.status()).toBe(200);

        await expect(async () => {
          const events = await eventSubscriber.receive({
            since: start,
            match: eventWithId(templateId),
          });

          expect(events).toHaveLength(3);

          expect(events).toContainEqual(
            expect.objectContaining({
              record: expect.objectContaining({
                type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
                data: expect.objectContaining({
                  id: templateId,
                  name,
                }),
              }),
            })
          );

          expect(events).toContainEqual(
            expect.objectContaining({
              record: expect.objectContaining({
                type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
                data: expect.objectContaining({
                  id: templateId,
                  name: 'UPDATED',
                }),
              }),
            })
          );

          expect(events).toContainEqual(
            expect.objectContaining({
              record: expect.objectContaining({
                type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
                data: expect.objectContaining({
                  id: templateId,
                  name: 'UPDATED',
                }),
              }),
            })
          );
        }).toPass({ timeout: 60_000 });
      });

      test('Expect Deleted.v1 event When deleting templates', async ({
        request,
        eventSubscriber,
      }) => {
        const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: digitalChannel,
        });

        const start = new Date();

        const createResponse = await request.post(
          `${process.env.API_BASE_URL}/v1/template`,
          {
            headers: {
              Authorization: await userRoutingEnabled.getAccessToken(),
            },
            data: template,
          }
        );

        expect(createResponse.status()).toBe(201);

        const {
          data: { id: templateId, lockNumber },
        } = await createResponse.json();

        templateStorageHelper.addAdHocTemplateKey({
          templateId,
          clientId: userRoutingEnabled.clientId,
        });

        const deleteResponse = await request.delete(
          `${process.env.API_BASE_URL}/v1/template/${templateId}`,
          {
            headers: {
              Authorization: await userRoutingEnabled.getAccessToken(),
              'X-Lock-Number': String(lockNumber),
            },
          }
        );

        expect(deleteResponse.status()).toBe(204);

        await expect(async () => {
          const events = await eventSubscriber.receive({
            since: start,
            match: eventWithId(templateId),
          });

          expect(events).toHaveLength(2);

          expect(events).toContainEqual(
            expect.objectContaining({
              record: expect.objectContaining({
                type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
                data: expect.objectContaining({
                  id: templateId,
                }),
              }),
            })
          );

          expect(events).toContainEqual(
            expect.objectContaining({
              record: expect.objectContaining({
                type: 'uk.nhs.notify.template-management.TemplateDeleted.v1',
                data: expect.objectContaining({
                  id: templateId,
                }),
              }),
            })
          );
        }).toPass({ timeout: 60_000 });
      });
    });
  }
});
