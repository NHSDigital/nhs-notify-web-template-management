import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { docxFixtures } from '../fixtures/letters';
import { Template } from 'helpers/types';

const baseTemplateData = {
  templateType: 'LETTER',
  campaignId: 'Campaign1',
  letterVersion: 'AUTHORING',
};

test.describe('Letter rendering', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test.describe('Initial render', () => {
    test('produces initial render', async ({ request }) => {
      const { multipart, contentType } =
        TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
          baseTemplateData,
          docxFixtures.standard.open()
        );

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/docx-letter-template`,
        {
          data: multipart,
          headers: {
            Authorization: await user.getAccessToken(),
            'Content-Type': contentType,
          },
        }
      );

      const result = await response.json();
      const debug = JSON.stringify(result, null, 2);

      expect(response.status(), debug).toBe(201);

      const template = result.data as Template;

      const templateKey = {
        templateId: template.id,
        clientId: user.clientId,
      };

      templateStorageHelper.addAdHocTemplateKey(templateKey);

      expect(template.templateStatus).toBe('PENDING_VALIDATION');

      let validatedTemplate: Template | undefined;

      await expect(async () => {
        const updatedTemplate =
          await templateStorageHelper.getTemplate(templateKey);

        expect(updatedTemplate).toEqual(
          expect.objectContaining({
            templateStatus: 'NOT_YET_SUBMITTED',
            files: expect.objectContaining({
              initialRender: expect.objectContaining({
                status: 'RENDERED',
                fileName: expect.any(String),
              }),
            }),
          })
        );

        validatedTemplate = updatedTemplate;
      }).toPass();

      const render = await templateStorageHelper.getRenderFile(
        templateKey,
        'initial',
        validatedTemplate!.files!.initialRender!.fileName
      );

      expect(render?.buffer).toBeInstanceOf(Buffer);
    });
  });
});
