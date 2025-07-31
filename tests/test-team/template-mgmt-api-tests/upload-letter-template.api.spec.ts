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
  uuidRegExp,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import { testClients } from '../helpers/client/client-helper';

test.describe('POST /v1/letter-template', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;
  let user6: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
    user6 = await authHelper.getTestUser(testUsers.User6.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('returns 201 if input is valid', async ({ request }) => {
    const { templateData, multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileName: 'template.pdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.withPersonalisation.pdf.open(),
          },
          {
            _type: 'file',
            partName: 'testCsv',
            fileName: 'test-data.csv',
            fileType: 'text/csv',
            file: pdfUploadFixtures.withPersonalisation.csv.open(),
          },
        ]
      );

    const start = new Date();

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      id: result.template.id,
      owner: user1.userId,
    });

    expect(result).toEqual({
      statusCode: 201,
      template: {
        campaignId: testClients[user1.clientKey]?.campaignId,
        createdAt: expect.stringMatching(isoDateRegExp),
        files: {
          pdfTemplate: {
            currentVersion: expect.stringMatching(uuidRegExp),
            fileName: 'template.pdf',
            virusScanStatus: 'PENDING',
          },
          testDataCsv: {
            currentVersion: expect.stringMatching(uuidRegExp),
            fileName: 'test-data.csv',
            virusScanStatus: 'PENDING',
          },
          proofs: {},
        },
        id: expect.stringMatching(uuidRegExp),
        language: 'en',
        letterType: 'x0',
        name: templateData.name,
        owner: user1.userId,
        templateStatus: 'PENDING_VALIDATION',
        templateType: templateData.templateType,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(result.template.files.pdfTemplate.currentVersion).toBe(
      result.template.files.testDataCsv.currentVersion
    );

    expect(result.template.createdAt).toBeDateRoughlyBetween([
      start,
      new Date(),
    ]);
    expect(result.template.createdAt).not.toEqual(result.template.updatedAt);
  });

  test('returns 201 if input is valid, test data is optional', async ({
    request,
  }) => {
    const { templateData, multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileName: 'template.pdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.noCustomPersonalisation.pdf.open(),
          },
        ]
      );

    const start = new Date();

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      id: result.template.id,
      owner: user1.userId,
    });

    expect(result).toEqual({
      statusCode: 201,
      template: {
        campaignId: testClients[user1.clientKey]?.campaignId,
        createdAt: expect.stringMatching(isoDateRegExp),
        files: {
          pdfTemplate: {
            currentVersion: expect.stringMatching(uuidRegExp),
            fileName: 'template.pdf',
            virusScanStatus: 'PENDING',
          },
          proofs: {},
        },
        id: expect.stringMatching(uuidRegExp),
        language: 'en',
        letterType: 'x0',
        name: templateData.name,
        owner: user1.userId,
        templateStatus: 'PENDING_VALIDATION',
        templateType: templateData.templateType,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(result.template.createdAt).toBeDateRoughlyBetween([
      start,
      new Date(),
    ]);
    expect(result.template.createdAt).not.toEqual(result.template.updatedAt);
  });

  test('user without a clientId assigned can create a template', async ({
    request,
  }) => {
    const { templateData, multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileName: 'template.pdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.noCustomPersonalisation.pdf.open(),
          },
        ]
      );

    const start = new Date();

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
      {
        data: multipart,
        headers: {
          Authorization: await user6.getAccessToken(),
          'Content-Type': contentType,
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(201);

    templateStorageHelper.addAdHocTemplateKey({
      id: result.template.id,
      owner: user6.userId,
    });

    expect(result).toEqual({
      statusCode: 201,
      template: {
        createdAt: expect.stringMatching(isoDateRegExp),
        files: {
          pdfTemplate: {
            currentVersion: expect.stringMatching(uuidRegExp),
            fileName: 'template.pdf',
            virusScanStatus: 'PENDING',
          },
          proofs: {},
        },
        id: expect.stringMatching(uuidRegExp),
        language: 'en',
        letterType: 'x0',
        name: templateData.name,
        owner: user6.userId,
        templateStatus: 'PENDING_VALIDATION',
        templateType: templateData.templateType,
        updatedAt: expect.stringMatching(isoDateRegExp),
      },
    });

    expect(result.template.createdAt).toBeDateRoughlyBetween([
      start,
      new Date(),
    ]);
    expect(result.template.createdAt).not.toEqual(result.template.updatedAt);
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`
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
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
          templateType: 'LETTER',
          templateStatus: 'SUBMITTED',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileName: 'template.pdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.noCustomPersonalisation.pdf.open(),
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      id: result.template.id,
      owner: user1.userId,
    });

    expect(result.template.templateStatus).toEqual('PENDING_VALIDATION');
  });

  test('returns 400 if template is missing required property (name)', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
          name: undefined,
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileName: 'template.pdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.withPersonalisation.pdf.open(),
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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

  test('returns 400 if PDF part cannot be identified in form parts', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'UNEXPECTED',
            fileName: 'template.pdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.withPersonalisation.pdf.open(),
          },
          {
            _type: 'file',
            partName: 'testCsv',
            fileName: 'test-data.csv',
            fileType: 'text/csv',
            file: pdfUploadFixtures.withPersonalisation.csv.open(),
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      technicalMessage: 'Failed to identify or validate PDF data',
    });
  });

  test('returns 400 if PDF part has the wrong content type', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileName: 'template.pdf',
            fileType: 'UNEXPECTED',
            file: pdfUploadFixtures.noCustomPersonalisation.pdf.open(),
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      technicalMessage: 'Failed to identify or validate PDF data',
    });
  });

  test('returns 400 if PDF part has no filename', async ({ request }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileType: 'application/pdf',
            file: pdfUploadFixtures.noCustomPersonalisation.pdf.open(),
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      technicalMessage: 'Failed to identify or validate PDF data',
    });
  });

  test('returns 400 if CSV part is present but is invalid', async ({
    request,
  }) => {
    const { multipart, contentType } =
      TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
        {
          templateType: 'LETTER',
        },
        [
          {
            _type: 'json',
            partName: 'template',
          },
          {
            _type: 'file',
            partName: 'letterPdf',
            fileType: 'application/pdf',
            fileName: 'template.pdf',
            file: pdfUploadFixtures.withPersonalisation.pdf.open(),
          },
          {
            _type: 'file',
            partName: 'testCsv',
            file: pdfUploadFixtures.withPersonalisation.csv.open(),
          },
        ]
      );

    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/letter-template`,
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
      technicalMessage: 'Failed to validate CSV data',
    });
  });
});
