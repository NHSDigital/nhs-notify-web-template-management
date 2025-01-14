import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';

test.describe('GET /v1/template/:templateId', async () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const createdTemplates: { owner: string; id: string }[] = [];
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(TestUserId.User1);
    user2 = await authHelper.getTestUser(TestUserId.User2);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplates(createdTemplates);
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
    const template = {
      templateType: 'NHS_APP',
      name: faker.word.noun(),
      message: faker.word.words(5),
    };

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

    createdTemplates.push({ id: created.template.id, owner: user1.email });

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
    const template = {
      templateType: 'NHS_APP',
      name: faker.word.noun(),
      message: faker.word.words(5),
    };

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

    createdTemplates.push({ id: created.template.id, owner: user1.email });

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
});
