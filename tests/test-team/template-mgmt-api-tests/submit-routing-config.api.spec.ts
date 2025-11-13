import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import type { FactoryRoutingConfig } from '../helpers/types';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import { RoutingConfigStatus } from 'nhs-notify-backend-client';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';

test.describe('PATCH /v1/routing-configuration/:routingConfigId/submit', () => {
  const authHelper = createAuthHelper();
  const routingConfigStorage = new RoutingConfigStorageHelper();
  const templateStorage = new TemplateStorageHelper();
  let user1: TestUser;
  let userDifferentClient: TestUser;
  let userSharedClient: TestUser;
  let userRoutingDisabled: TestUser;

  let routingConfigNoUpdates: FactoryRoutingConfig;
  let routingConfigSuccessfullySubmit: FactoryRoutingConfig;
  let routingConfigAlreadySubmitted: FactoryRoutingConfig;
  let routingConfigDeleted: FactoryRoutingConfig;
  let routingConfigSubmitBySharedClientUser: FactoryRoutingConfig;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    userDifferentClient = await authHelper.getTestUser(
      testUsers.UserRoutingEnabled.userId
    );
    userSharedClient = await authHelper.getTestUser(testUsers.User7.userId);
    userRoutingDisabled = await authHelper.getTestUser(testUsers.User2.userId);

    routingConfigNoUpdates = RoutingConfigFactory.create(user1);
    routingConfigSuccessfullySubmit = RoutingConfigFactory.create(user1);

    routingConfigAlreadySubmitted = RoutingConfigFactory.create(user1, {
      status: 'COMPLETED',
    });

    routingConfigDeleted = RoutingConfigFactory.create(user1, {
      status: 'DELETED',
    });

    routingConfigSubmitBySharedClientUser = RoutingConfigFactory.create(user1);

    await routingConfigStorage.seed([
      routingConfigNoUpdates.dbEntry,
      routingConfigSuccessfullySubmit.dbEntry,
      routingConfigAlreadySubmitted.dbEntry,
      routingConfigDeleted.dbEntry,
      routingConfigSubmitBySharedClientUser.dbEntry,
    ]);
  });

  test.afterAll(async () => {
    await routingConfigStorage.deleteSeeded();
    await templateStorage.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config/submit`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if routing config does not exist', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/noexist/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );
    const responseBody = await response.json();
    const dbg = JSON.stringify(responseBody);

    expect(response.status(), dbg).toBe(404);
    expect(responseBody).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing Config not found',
    });
  });

  test('returns 404 if routing config exists but is owned by a different client', async ({
    request,
  }) => {
    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigNoUpdates.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(404);
    expect(await updateResponse.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing Config not found',
    });
  });

  // TODO: CCM-12685
  // at the moment there is no validation on presence of referenced templates
  // so you can submit a config which doesn't reference any templates
  // the request in this test will become an error case when CCM-12685 is implemented
  test('returns 200 and the updated routing config data', async ({
    request,
  }) => {
    const start = new Date();

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSuccessfullySubmit.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfigSuccessfullySubmit.apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(updated.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(updated.data.createdAt).toEqual(
      routingConfigSuccessfullySubmit.dbEntry.createdAt
    );
  });

  test('returns 200 and the updated routing config data - sets referenced templates to LOCKED', async ({
    request,
  }) => {
    const nhsAppTemplate = TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user1
    );
    const emailTemplate = TemplateFactory.createEmailTemplate(
      randomUUID(),
      user1
    );
    const smsTemplate = TemplateFactory.createSmsTemplate(randomUUID(), user1);
    const letterTemplate = TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user1,
      'letter-template',
      'SUBMITTED'
    );
    const templates = [
      nhsAppTemplate,
      emailTemplate,
      smsTemplate,
      letterTemplate,
    ];

    await templateStorage.seedTemplateData(templates);

    const routingConfig = RoutingConfigFactory.createWithChannels(user1, [
      'NHSAPP',
      'EMAIL',
      'SMS',
      'LETTER',
    ])
      .addTemplate('NHSAPP', nhsAppTemplate.id)
      .addTemplate('EMAIL', emailTemplate.id)
      .addTemplate('SMS', smsTemplate.id)
      .addTemplate('LETTER', letterTemplate.id);

    await routingConfigStorage.seed([routingConfig.dbEntry]);

    const start = new Date();

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfig.apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(updated.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(updated.data.createdAt).toEqual(routingConfig.dbEntry.createdAt);

    for (const template of templates) {
      const latest = await templateStorage.getTemplate({
        templateId: template.id,
        clientId: user1.clientId,
      });

      expect(latest.templateStatus).toBe('LOCKED');
      expect(latest.lockNumber).toBe(template.lockNumber + 1);
      expect(latest.updatedAt).toEqual(updated.data.updatedAt);
    }
  });

  test('returns 200 - can reference templates that are already locked', async ({
    request,
  }) => {
    const nhsAppTemplate = TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user1
    );
    const emailTemplate = TemplateFactory.createEmailTemplate(
      randomUUID(),
      user1
    );
    const smsTemplate = TemplateFactory.createSmsTemplate(randomUUID(), user1);
    const letterTemplate = TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user1,
      'letter-template',
      'LOCKED'
    );

    nhsAppTemplate.templateStatus = 'LOCKED';
    emailTemplate.templateStatus = 'LOCKED';
    smsTemplate.templateStatus = 'LOCKED';

    const templates = [
      nhsAppTemplate,
      emailTemplate,
      smsTemplate,
      letterTemplate,
    ];

    await templateStorage.seedTemplateData(templates);

    const routingConfig = RoutingConfigFactory.createWithChannels(user1, [
      'NHSAPP',
      'EMAIL',
      'SMS',
      'LETTER',
    ])
      .addTemplate('NHSAPP', nhsAppTemplate.id)
      .addTemplate('EMAIL', emailTemplate.id)
      .addTemplate('SMS', smsTemplate.id)
      .addTemplate('LETTER', letterTemplate.id);

    await routingConfigStorage.seed([routingConfig.dbEntry]);

    const start = new Date();

    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfig.apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(updated.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
    expect(updated.data.createdAt).toEqual(routingConfig.dbEntry.createdAt);

    for (const template of templates) {
      const latest = await templateStorage.getTemplate({
        templateId: template.id,
        clientId: user1.clientId,
      });

      expect(latest.templateStatus).toBe('LOCKED');
      expect(latest.lockNumber).toBe(template.lockNumber + 1);
      expect(latest.updatedAt).toEqual(updated.data.updatedAt);
    }
  });

  test('returns 400 - cannot submit a COMPLETED routing config', async ({
    request,
  }) => {
    const failedSubmitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigAlreadySubmitted.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(failedSubmitResponse.status()).toBe(400);

    const updateResponseBody = await failedSubmitResponse.json();

    expect(updateResponseBody).toEqual({
      statusCode: 400,
      technicalMessage:
        'Routing Config with status COMPLETED cannot be updated',
    });
  });

  test('returns 404 - cannot submit a DELETED routing config', async ({
    request,
  }) => {
    const failedSubmitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigDeleted.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(failedSubmitResponse.status()).toBe(404);

    const updateResponseBody = await failedSubmitResponse.json();

    expect(updateResponseBody).toEqual({
      statusCode: 404,
      technicalMessage: 'Routing Config not found',
    });
  });

  test("returns 400 - routing config references a template that doesn't exist", async ({
    request,
  }) => {
    const routingConfig = RoutingConfigFactory.createWithChannels(user1, [
      'NHSAPP',
    ]).addTemplate('NHSAPP', randomUUID());

    await routingConfigStorage.seed([routingConfig.dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage:
        'Unable to lock one or more templates referenced in Routing Config',
    });
  });

  test('returns 400 - routing config references a template in wrong status', async ({
    request,
  }) => {
    const template = TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user1,
      'letter-template',
      'PENDING_PROOF_REQUEST'
    );

    const templates = [template];

    await templateStorage.seedTemplateData(templates);

    const routingConfig = RoutingConfigFactory.createWithChannels(user1, [
      'LETTER',
    ]).addTemplate('LETTER', template.id);

    await routingConfigStorage.seed([routingConfig.dbEntry]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfig.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage:
        'Unable to lock one or more templates referenced in Routing Config',
    });
  });

  test('user belonging to the same client as the creator can submit', async ({
    request,
  }) => {
    const updateResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${routingConfigSubmitBySharedClientUser.dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
      }
    );

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();

    expect(user1.clientId).toBe(userSharedClient.clientId);

    expect(updated).toEqual({
      statusCode: 200,
      data: {
        ...routingConfigSubmitBySharedClientUser.apiResponse,
        status: 'COMPLETED' satisfies RoutingConfigStatus,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });
  });

  test('returns 400 if routing feature is disabled on the client', async ({
    request,
  }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/some-routing-config/submit`,
      {
        headers: {
          Authorization: await userRoutingDisabled.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Routing feature is disabled',
    });
  });
});
