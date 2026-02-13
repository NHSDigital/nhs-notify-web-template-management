import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { randomUUID } from 'node:crypto';

test.describe('PATCH /v1/template/:templateId', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let userDifferentClient: TestUser;
  let userSharedClient: TestUser;

  test.beforeAll(async () => {
    const clientMultipleCampaigns = await authHelper.getStaticClient(
      'ClientWithMultipleCampaigns'
    );
    user1 = await authHelper.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );
    userDifferentClient = await authHelper.getTestUser(testUsers.User2.userId);
    userSharedClient = await authHelper.createAdHocUser(
      clientMultipleCampaigns.id
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/some-template`,
      {
        headers: {
          'X-Lock-Number': '1',
        },
        data: {
          name: 'New template name',
        },
      }
    );
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if template does not exist', async ({ request }) => {
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/noexist`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': '1',
        },
        data: {
          name: 'New template name',
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
      'Old template name'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await userDifferentClient.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          name: 'New template name',
        },
      }
    );

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 400 if no body on request', async ({ request }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
      }
    );

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        $root: 'Unexpected empty object',
      },
    });
  });

  test('returns 400 if request body is empty', async ({ request }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {},
      }
    );

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        $root: 'Unexpected empty object',
      },
    });
  });

  test('returns 200 and the updated template data', async ({ request }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name',
      'NOT_YET_SUBMITTED',
      { letterVariantId: 'letter-variant', campaignId: user1.campaignIds?.[0] }
    );

    await templateStorageHelper.seedTemplateData([template]);

    const start = new Date();

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          name: 'New template name',
          campaignId: user1.campaignIds?.[1],
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    const { owner, proofingEnabled, version, ...dto } = template;

    expect(body).toEqual({
      statusCode: 200,
      data: {
        ...dto,
        name: 'New template name',
        campaignId: user1.campaignIds?.[1],
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: template.lockNumber + 1,
        updatedBy: `INTERNAL_USER#${user1.internalUserId}`,
      },
    });

    expect(body.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
  });

  test('returns 400 - cannot set an campaign id not associated with the client', async ({
    request,
  }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Template name',
      'NOT_YET_SUBMITTED',
      { letterVariantId: 'letter-variant', campaignId: user1.campaignIds?.[0] }
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          campaignId: 'Random value',
        },
      }
    );

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 400,
      technicalMessage: 'Invalid campaign ID in request',
    });
  });

  test('returns 400 - cannot update an approved template', async ({
    request,
  }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name',
      'PROOF_APPROVED'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          name: 'New template name',
        },
      }
    );

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 400,
      technicalMessage: 'Template with status PROOF_APPROVED cannot be updated',
    });
  });

  test('returns 400 - cannot update a submitted template', async ({
    request,
  }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name',
      'SUBMITTED'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          name: 'New template name',
        },
      }
    );

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 400,
      technicalMessage: 'Template with status SUBMITTED cannot be updated',
    });
  });

  test('returns 404 - cannot update a deleted template', async ({
    request,
  }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name',
      'DELETED'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          name: 'New template name',
        },
      }
    );

    expect(response.status()).toBe(404);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 400 if template name is empty', async ({ request }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          name: '',
        },
      }
    );

    expect(response.status()).toBe(400);

    expect(await response.json()).toEqual({
      details: {
        name: 'Too small: expected string to have >=1 characters',
      },
      statusCode: 400,
      technicalMessage: 'Request failed validation',
    });
  });

  test('returns 400 if the lock number header is not set', async ({
    request,
  }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: {
          name: 'New template name',
        },
      }
    );

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 400,
      technicalMessage: 'Invalid lock number provided',
    });
  });

  test('returns 409 if the lock number header does not match the current one', async ({
    request,
  }) => {
    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber + 1),
        },
        data: {
          name: 'New template name',
        },
      }
    );

    expect(response.status()).toBe(409);

    const body = await response.json();

    expect(body).toEqual({
      statusCode: 409,
      technicalMessage:
        'Lock number mismatch - Template has been modified since last read',
    });
  });

  test('user belonging to the same client as the creator can update', async ({
    request,
  }) => {
    expect(user1.clientId).toBe(userSharedClient.clientId);

    const template = TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user1,
      'Old template name',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: 'letter-variant',
      }
    );

    await templateStorageHelper.seedTemplateData([template]);

    const start = new Date();

    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${template.id}`,
      {
        headers: {
          Authorization: await userSharedClient.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          name: 'New template name',
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    const { owner, proofingEnabled, version, ...dto } = template;

    expect(body).toEqual({
      statusCode: 200,
      data: {
        ...dto,
        name: 'New template name',
        updatedAt: expect.stringMatching(isoDateRegExp),
        lockNumber: template.lockNumber + 1,
        updatedBy: `INTERNAL_USER#${userSharedClient.internalUserId}`,
      },
    });

    expect(body.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
  });
});
