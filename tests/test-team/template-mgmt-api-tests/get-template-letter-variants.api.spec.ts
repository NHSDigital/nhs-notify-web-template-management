import { test, expect } from '@playwright/test';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { randomUUID } from 'node:crypto';
import { getTestContext } from 'helpers/context/context';

test.describe('GET /v1/template/:id/letter-variants', () => {
  const context = getTestContext();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let user2: TestUser;

  test.beforeAll(async () => {
    user1 = await context.auth.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );
    user2 = await context.auth.getTestUser(testUsers.User2.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Letter Template'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${template.id}/letter-variants`
    );

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test("returns 404 if template doesn't exist", async ({ request }) => {
    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/noexist/letter-variants`,
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

  test('returns 404 if template exists but is owned by a different client', async ({
    request,
  }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Letter Template'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${template.id}/letter-variants`,
      {
        headers: {
          Authorization: await user2.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 403 if template is not an authoring letter template (NHS_APP)', async ({
    request,
  }) => {
    const template = TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user1,
      'NHS App Template'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${template.id}/letter-variants`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({
      statusCode: 403,
      technicalMessage: 'Unsupported for this template type',
    });
  });

  test('returns 403 if template is a PDF letter template', async ({
    request,
  }) => {
    const template = TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user1,
      'PDF Letter Template'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${template.id}/letter-variants`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({
      statusCode: 403,
      technicalMessage: 'Unsupported for this template type',
    });
  });

  test('returns 200 with global and client scoped variants when template has no campaign id', async ({
    request,
  }) => {
    const globalVariants =
      await context.letterVariants.getGlobalLetterVariants();

    const clientVariants =
      await context.letterVariants.getClientScopedLetterVariants(
        user1.clientId
      );

    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Letter Template',
      'NOT_YET_SUBMITTED',
      { campaignId: null }
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${template.id}/letter-variants`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 200,
      data: expect.arrayContaining([...globalVariants, ...clientVariants]),
    });

    expect(body.data).toHaveLength(
      globalVariants.length + clientVariants.length
    );
  });

  test('returns 200 with global, client scoped, and campaign scoped variants when template has campaign id', async ({
    request,
  }) => {
    const globalVariants =
      await context.letterVariants.getGlobalLetterVariants();

    const clientVariants =
      await context.letterVariants.getClientScopedLetterVariants(
        user1.clientId
      );

    const [campaignId] = user1.campaignIds!;

    const campaignVariants =
      await context.letterVariants.getCampaignScopedLetterVariants(
        user1.clientId,
        campaignId
      );

    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Letter Template',
      'NOT_YET_SUBMITTED',
      { campaignId }
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.get(
      `${process.env.API_BASE_URL}/v1/template/${template.id}/letter-variants`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 200,
      data: expect.arrayContaining([
        ...globalVariants,
        ...clientVariants,
        ...campaignVariants,
      ]),
    });

    expect(body.data).toHaveLength(
      globalVariants.length + clientVariants.length + campaignVariants.length
    );
  });
});
