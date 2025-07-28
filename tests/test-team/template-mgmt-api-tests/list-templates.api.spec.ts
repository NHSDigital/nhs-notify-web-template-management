import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';

test.describe('GET /v1/templates', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    user2 = await authHelper.getTestUser(testUsers.User2.userId);
  });

  test.afterEach(async () => {
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

  test('lists templates belonging to the authenticated owner', async ({
    request,
  }) => {
    // setup

    // create a template for user 1
    const response1 = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );

    expect(response1.status()).toBe(201);

    const created1 = await response1.json();

    templateStorageHelper.addAdHocTemplateKey({
      id: created1.template.id,
      owner: user1.userId,
    });

    // create another template for user 1
    const response2 = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'SMS',
        }),
      }
    );

    expect(response2.status()).toBe(201);

    const created2 = await response2.json();

    templateStorageHelper.addAdHocTemplateKey({
      id: created2.template.id,
      owner: user1.userId,
    });

    // exercise - request user 1 templates
    const user1ListResponse = await request.get(
      `${process.env.API_BASE_URL}/v1/templatesBROKEN`,
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

  test('does not include deleted templates', async ({ request }) => {
    const response1 = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );

    expect(response1.status()).toBe(201);

    const created1 = await response1.json();

    templateStorageHelper.addAdHocTemplateKey({
      id: created1.template.id,
      owner: user1.userId,
    });

    // create another template for user 1
    const response2 = await request.post(
      `${process.env.API_BASE_URL}/v1/template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'SMS',
        }),
      }
    );

    expect(response2.status()).toBe(201);

    const created2 = await response2.json();

    templateStorageHelper.addAdHocTemplateKey({
      id: created2.template.id,
      owner: user1.userId,
    });

    // delete template 1

    const deleteResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/${created1.template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(deleteResponse.status()).toBe(204);

    // exercise - request templates list
    const listResponse = await request.get(
      `${process.env.API_BASE_URL}/v1/templates`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    //  assert on user 1 templates response
    expect(listResponse.status()).toBe(200);

    const responseBody = await listResponse.json();

    expect(responseBody).toEqual({
      statusCode: 200,
      templates: [created2.template],
    });
  });
});
