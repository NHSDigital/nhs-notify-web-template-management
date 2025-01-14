import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';

test.describe('GET /v1/templates', () => {
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

  test('lists templates belonging to the authenticated owner', async ({
    request,
  }) => {
    // setup

    // create a template for user 1
    const templateInput1 = {
      templateType: 'NHS_APP',
      name: faker.word.noun(),
      message: faker.word.words(5),
    };

    const response1 = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: templateInput1,
      }
    );

    expect(response1.status()).toBe(201);

    const created1 = await response1.json();

    // create another template for user 2
    const templateInput2 = {
      templateType: 'SMS',
      name: faker.word.noun(),
      message: faker.word.words(5),
    };

    const response2 = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: templateInput2,
      }
    );

    expect(response2.status()).toBe(201);

    const created2 = await response2.json();

    // exercise - request user 1 templates
    const user1ListResponse = await request.get(
      `${process.env.API_BASE_URL}/v1/templates`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    //  assert on user 1 templates response
    expect(user1ListResponse.status()).toBe(200);

    const user1ResponseBody = await user1ListResponse.json();

    expect(user1ResponseBody).toEqual({
      statusCode: 200,
      templates: expect.arrayContaining([created1.template, created2.template]),
    });

    expect(user1ResponseBody.templates.length).toBe(2);

    // exercise - request user 2 templates (they have no templates)
    const user2ListResponse = await request.get(
      `${process.env.API_BASE_URL}/v1/templates`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    // assert that user 2 gets an empty list
    expect(user2ListResponse.status()).toBe(200);

    const user2ResponseBody = await user2ListResponse.json();

    expect(user2ResponseBody).toEqual({
      statusCode: 200,
      templates: [],
    });
  });
});
