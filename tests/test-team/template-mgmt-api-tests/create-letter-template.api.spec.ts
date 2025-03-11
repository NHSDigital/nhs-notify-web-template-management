import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { isoDateRegExp, uuidRegExp } from '../helpers/regexp';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';

test.describe('POST /v1/template', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(TestUserId.User1);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
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

  test.describe('LETTER templates', () => {
    test('returns 201 if input is valid', async ({ request }) => {
      const { templateData, multipart, contentType } =
        TemplateAPIPayloadFactory.getCreateLetterTemplatePayload(
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
              file: pdfUploadFixtures.withPersonalisation.pdf,
            },
            {
              _type: 'file',
              partName: 'testCsv',
              fileName: 'test-data.csv',
              fileType: 'text/csv',
              file: pdfUploadFixtures.withPersonalisation.csv,
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
          createdAt: expect.stringMatching(isoDateRegExp),
          id: expect.stringMatching(uuidRegExp),
          name: templateData.name,
          language: 'en',
          letterType: 'x0',
          templateStatus: 'PENDING_VALIDATION',
          templateType: templateData.templateType,
          updatedAt: expect.stringMatching(isoDateRegExp),
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
          },
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
  });
});
