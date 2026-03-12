import { test, expect } from '@playwright/test';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { getTestContext } from 'helpers/context/context';

test.describe('GET /v1/template/:templateId', () => {
  const context = getTestContext();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let user2: TestUser;
  let userSharedClient: TestUser;

  test.beforeAll(async () => {
    user1 = await context.auth.getTestUser(testUsers.User1.userId);
    user2 = await context.auth.getTestUser(testUsers.User2.userId);
    userSharedClient = await context.auth.getTestUser(testUsers.User7.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/some-template`
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 200 if template exists and is owned by authenticated user', async ({
    request,
  }) => {
    // setup: create a template
    const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
      templateType: 'NHS_APP',
    });

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

    const created = await createResponse.json();

    templateStorageHelper.addAdHocTemplateKey({
      templateId: created.data.id,
      clientId: user1.clientId,
    });

    // exercise: make the GET request to retrieve the template
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    // assert
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: created.data,
    });
  });

  test('returns 404 if template does not exist', async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/noexist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 404 if template exists but is owned by a different user', async ({
    request,
  }) => {
    // setup: create a template belonging to user1
    const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
      templateType: 'NHS_APP',
    });

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

    const created = await createResponse.json();

    templateStorageHelper.addAdHocTemplateKey({
      templateId: created.data.id,
      clientId: user1.clientId,
    });

    // exercise: make the GET request to retrieve the template as user2
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    // assert
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 404 if template has been deleted', async ({ request }) => {
    // setup: create a template belonging to user1
    const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
      templateType: 'NHS_APP',
    });

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

    const created = await createResponse.json();

    templateStorageHelper.addAdHocTemplateKey({
      templateId: created.data.id,
      clientId: user1.clientId,
    });

    const deleteResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(created.data.lockNumber),
        },
      }
    );

    expect(deleteResponse.status()).toBe(204);

    // exercise: make the GET request to retrieve the deleted template
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    // assert
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('user belonging to the same client as the creator can get template', async ({
    request,
  }) => {
    const template = TemplateAPIPayloadFactory.getCreateTemplatePayload({
      templateType: 'NHS_APP',
    });

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

    const created = await createResponse.json();

    templateStorageHelper.addAdHocTemplateKey({
      templateId: created.data.id,
      clientId: user1.clientId,
    });

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${created.data.id}`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      statusCode: 200,
      data: created.data,
    });
  });
});
