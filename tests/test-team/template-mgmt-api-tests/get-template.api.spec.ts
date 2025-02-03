import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';

test.describe('GET /v1/template/:templateId', async () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(TestUserId.User1);
    user2 = await authHelper.getTestUser(TestUserId.User2);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
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
      id: created.template.id,
      owner: user1.userId,
    });

    // exercise: make the GET request to retrieve the template
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
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
      template: created.template,
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
      id: created.template.id,
      owner: user1.userId,
    });

    // exercise: make the GET request to retrieve the template as user2
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
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
      id: created.template.id,
      owner: user1.userId,
    });

    const deleteResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: { ...template, templateStatus: 'DELETED' },
      }
    );

    expect(deleteResponse.status()).toBe(200);

    // exercise: make the GET request to retrieve the deleted template
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${created.template.id}`,
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
});
