import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { EventCacheHelper } from '../helpers/events/event-cache-helper';

const DIGITAL_CHANNELS = ['NHS_APP', 'SMS', 'EMAIL'] as const;

test.describe('Event publishing - Digital', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const eventCacheHelper = new EventCacheHelper();

  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  for (const digitalChannel of DIGITAL_CHANNELS) {
    test.describe(`${digitalChannel} template events`, () => {
      test('Expect Draft.v1 event When Creating And Updating templates And Completed.v1 event When submitting templates', async ({
        request,
      }) => {
        const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: digitalChannel,
        });

        const start = new Date();

        const createResponse = await request.post(
          `${process.env.API_BASE_URL}/v1/template`,
          {
            headers: {
              Authorization: await user1.getAccessToken(),
            },
            data: template,
          }
        );

        expect(createResponse.status()).toBe(201);

        const {
          template: { id: templateId, name },
        } = await createResponse.json();

        templateStorageHelper.addAdHocTemplateKey({
          templateId: templateId,
          clientId: user1.clientId,
        });

        const updateResponse = await request.post(
          `${process.env.API_BASE_URL}/v1/template/${templateId}`,
          {
            headers: {
              Authorization: await user1.getAccessToken(),
            },
            data: TemplateAPIPayloadFactory.getUpdateTemplatePayload({
              templateType: digitalChannel,
              name: 'UPDATED',
            }),
          }
        );

        expect(updateResponse.status()).toBe(200);

        // submit template - should be a completed event SUBMITTED
        const submitResponse = await request.patch(
          `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
          {
            headers: {
              Authorization: await user1.getAccessToken(),
            },
          }
        );

        expect(submitResponse.status()).toBe(200);

        await expect(async () => {
          const events = await eventCacheHelper.findEvents(start, [
            templateId,
          ]);

          expect(events).toHaveLength(3);

          expect(events).toContainEqual(
            expect.objectContaining({
              type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
              data: expect.objectContaining({
                id: templateId,
                name,
                templateStatus: 'NOT_YET_SUBMITTED',
              }),
            })
          );

          expect(events).toContainEqual(
            expect.objectContaining({
              type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
              data: expect.objectContaining({
                id: templateId,
                name: 'UPDATED',
                templateStatus: 'NOT_YET_SUBMITTED',
              }),
            })
          );

          expect(events).toContainEqual(
            expect.objectContaining({
              type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
              data: expect.objectContaining({
                id: templateId,
                name: 'UPDATED',
                templateStatus: 'SUBMITTED',
              }),
            })
          );
        }).toPass({ timeout: 60_000, intervals: [1000, 3000, 5000, 10_000] });
      });

      test('Expect Deleted.v1 event When deleting templates', async ({
        request,
      }) => {
        const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: digitalChannel,
        });

        const start = new Date();

        const createResponse = await request.post(
          `${process.env.API_BASE_URL}/v1/template`,
          {
            headers: {
              Authorization: await user1.getAccessToken(),
            },
            data: template,
          }
        );

        expect(createResponse.status()).toBe(201);

        const {
          template: { id: templateId },
        } = await createResponse.json();

        templateStorageHelper.addAdHocTemplateKey({
          templateId: templateId,
          clientId: user1.clientId,
        });

        const updateResponse = await request.delete(
          `${process.env.API_BASE_URL}/v1/template/${templateId}`,
          {
            headers: {
              Authorization: await user1.getAccessToken(),
            },
          }
        );

        expect(updateResponse.status()).toBe(204);

        await expect(async () => {
          const events = await eventCacheHelper.findEvents(start, [
            templateId,
          ]);

          expect(events).toHaveLength(2);

          expect(events).toContainEqual(
            expect.objectContaining({
              type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
              data: expect.objectContaining({
                id: templateId,
                templateStatus: 'NOT_YET_SUBMITTED',
              }),
            })
          );

          expect(events).toContainEqual(
            expect.objectContaining({
              type: 'uk.nhs.notify.template-management.TemplateDeleted.v1',
              data: expect.objectContaining({
                id: templateId,
                templateStatus: 'DELETED',
              }),
            })
          );
        }).toPass({ timeout: 60_000, intervals: [1000, 3000, 5000, 10_000] });
      });
    });
  }
});
