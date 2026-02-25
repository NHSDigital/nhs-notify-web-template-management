import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import {
  isoDateRegExp,
  UploadPartSpec,
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { docxFixtures } from '../fixtures/letters';

const baseTemplateData = {
  templateType: 'LETTER',
  campaignId: 'Campaign1',
  letterVersion: 'AUTHORING',
};

const baseTemplateFormData: UploadPartSpec = {
  _type: 'json',
  partName: 'template',
};

const baseDocxMultipartFormData: UploadPartSpec = {
  _type: 'file',
  partName: 'docxTemplate',
  fileName: 'template.docx',
  fileType:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  file: docxFixtures.standard.open(),
};

test.describe('POST /v1/docx-letter-template', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('returns 201 if input is valid', async ({ request }) => {
    const { templateData, multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        baseTemplateData,
        [baseTemplateFormData, baseDocxMultipartFormData]
      );

    const start = new Date();

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user1.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(201);

    templateStorageHelper.addAdHocTemplateKey({
      templateId: result.data.id,
      clientId: user1.clientId,
    });

    expect(result).toEqual({
      statusCode: 201,
      data: {
        campaignId: user1.campaignIds?.[0],
        createdAt: expect.stringMatching(isoDateRegExp),
        files: {
          docxTemplate: {
            currentVersion: expect.stringMatching(uuidRegExp),
            fileName: 'template.docx',
            virusScanStatus: 'PENDING',
          },
        },
        id: expect.stringMatching(uuidRegExp),
        language: 'en',
        letterType: 'x0',
        letterVersion: 'AUTHORING',
        name: templateData.name,
        templateStatus: 'PENDING_VALIDATION',
        templateType: templateData.templateType,
        updatedAt: expect.stringMatching(isoDateRegExp),
        clientId: user1.clientId,
        lockNumber: 0,
        createdBy: `INTERNAL_USER#${user1.internalUserId}`,
        updatedBy: `INTERNAL_USER#${user1.internalUserId}`,
      },
    });

    expect(result.data.createdAt).toBeDateRoughlyBetween([start, new Date()]);
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(401);
    expect(result).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 400 if no body on request', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(400);

    expect(result).toEqual({
      statusCode: 400,
      technicalMessage: 'Unexpected number of form parts in form data: 0',
    });
  });

  test('returns 400 if body is not form data', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
        },
        data: TemplateAPIPayloadFactory.getCreateTemplatePayload({
          templateType: 'NHS_APP',
        }),
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(400);

    expect(result).toEqual({
      statusCode: 400,
      technicalMessage: 'Unexpected number of form parts in form data: 0',
    });
  });

  test('ignores template status if given - template cannot be submitted at create time', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          ...baseTemplateData,
          templateStatus: 'SUBMITTED',
        },
        [baseTemplateFormData, baseDocxMultipartFormData]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user1.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(201);

    templateStorageHelper.addAdHocTemplateKey({
      templateId: result.data.id,
      clientId: user1.clientId,
    });

    expect(result.data.templateStatus).toEqual('PENDING_VALIDATION');
  });

  test('returns 400 if template is missing required property (name)', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          ...baseTemplateData,
          name: undefined,
        },
        [baseTemplateFormData, baseDocxMultipartFormData]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user1.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Request failed validation',
      details: {
        name: 'Invalid input: expected string, received undefined',
      },
    });
  });

  test('returns 400 if DOCX part cannot be identified in form parts', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        baseTemplateData,
        [
          baseTemplateFormData,
          {
            ...baseDocxMultipartFormData,
            partName: 'UNEXPECTED',
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user1.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Docx template file is unavailable or cannot be parsed',
    });
  });

  test('returns 400 if PDF part has the wrong content type', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        baseTemplateData,
        [
          baseTemplateFormData,
          {
            ...baseDocxMultipartFormData,
            fileType: 'UNEXPECTED',
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user1.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Failed to identify or validate DOCX data',
    });
  });

  test('returns 400 if PDF part has no filename', async ({ request }) => {
    const { fileName: _, ...docxMultipartFormData } = baseDocxMultipartFormData;
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        baseTemplateData,
        [baseTemplateFormData, docxMultipartFormData]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/docx-letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user1.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(400);

    expect(await response.json()).toEqual({
      statusCode: 400,
      technicalMessage: 'Docx template file is unavailable or cannot be parsed',
    });
  });
});
