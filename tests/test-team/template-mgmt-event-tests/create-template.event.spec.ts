import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  isoDateRegExp,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { testClients } from '../helpers/client/client-helper';

test.describe('POST /v1/template', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test.describe('NHS_APP templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'NHS_APP',
      });

      const start = new Date();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          name: template.name,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(created.template.createdAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(created.template.createdAt).toEqual(created.template.updatedAt);
    });
  });

  test.describe('SMS templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'SMS',
      });

      const start = new Date();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          name: template.name,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(created.template.createdAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(created.template.createdAt).toEqual(created.template.updatedAt);
    });
  });

  test.describe('EMAIL templates', () => {
    test('returns 201 if template is valid', async ({ request }) => {
      const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
        templateType: 'EMAIL',
      });

      const start = new Date();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/template`,
        {
          headers: {
            Authorization: await user1.getAccessToken(),
          },
          data: template,
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      templateStorageHelper.addAdHocTemplateKey({
        id: created.template.id,
        owner: user1.userId,
      });

      expect(created).toEqual({
        statusCode: 201,
        template: {
          campaignId: testClients[user1.clientKey]?.campaignId,
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          message: template.message,
          name: template.name,
          subject: template.subject,
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: template.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
        },
      });

      expect(created.template.createdAt).toBeDateRoughlyBetween([
        start,
        new Date(),
      ]);
      expect(created.template.createdAt).toEqual(created.template.updatedAt);
    });
  });
});
