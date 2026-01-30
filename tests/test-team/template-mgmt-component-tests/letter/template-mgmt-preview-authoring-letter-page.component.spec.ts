import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtPreviewLetterPage } from '../../pages/letter/template-mgmt-preview-letter-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

  return {
    empty: {
      id: 'preview-page-invalid-authoring-letter',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
      letterVersion: 'AUTHORING',
      lockNumber: 0,
      name: 'empty-authoring-letter',
      // Missing sidesCount - should be invalid
    } as Template,
    valid: TemplateFactory.createAuthoringLetterTemplate(
      'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
      user,
      'authoring-letter-valid',
      'NOT_YET_SUBMITTED',
      { sidesCount: 4, letterVariantId: 'variant-123' }
    ),
  };
}

test.describe('Preview AUTHORING Letter template Page', () => {
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded with template details', async ({
    page,
    baseURL,
  }) => {
    const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await previewPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-letter-template/${templates.valid.id}`
    );

    await expect(previewPage.pageHeading).toContainText(templates.valid.name);

    await expect(previewPage.templateId).toContainText(templates.valid.id);

    await expect(previewPage.editNameLink).toBeVisible();

    await expect(previewPage.statusTag).toBeVisible();
  });

  test('displays Learn more links with correct external URLs', async ({
    page,
  }) => {
    const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await previewPage.loadPage();

    await expect(previewPage.sheetsAction).toHaveAttribute(
      'href',
      'https://notify.nhs.uk/pricing-and-commercial/letters'
    );

    await expect(previewPage.statusAction).toHaveAttribute(
      'href',
      'https://notify.nhs.uk/templates/what-template-statuses-mean'
    );
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        templates.empty.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        'fake-template-id'
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
