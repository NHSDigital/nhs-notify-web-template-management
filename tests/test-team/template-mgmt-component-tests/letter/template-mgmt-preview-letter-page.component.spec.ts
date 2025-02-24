import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-preview-common.steps';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { Template, TemplateType, TemplateStatus } from '../../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtPreviewLetterPage } from '../../pages/letter/template-mgmt-preview-letter-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(TestUserId.User1);
  return {
    empty: {
      id: 'preview-page-invalid-letter-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: TemplateType.LETTER,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      owner: user.userId,
    } as Template,
    valid: {
      ...TemplateFactory.createLetterTemplate(
        'valid-letter-preview-template',
        user.userId
      ),
      name: 'test-template-letter',
      letterType: 'STANDARD',
      language: 'ENGLISH',
      pdfTemplateInputFile: 'file.pdf',
      testPersonalisationInputFile: 'test-data.csv',
    },
  };
}

test.describe('Preview Letter template Page', () => {
  let templates: { empty: Template; valid: Template };

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

    await previewLetterTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.valid.id}`
    );

    await expect(previewLetterTemplatePage.editRadioOption).not.toBeChecked();

    await expect(previewLetterTemplatePage.submitRadioOption).not.toBeChecked();

    await expect(previewLetterTemplatePage.pageHeader).toContainText(
      'test-template-letter'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewLetterPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackToAllTemplatesTopLink(props);
      await assertBackToAllTemplatesBottomLink(props);
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage(templates.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage(templates.valid.id);

      await previewLetterTemplatePage.clickContinueButton();

      await expect(previewLetterTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink =
        previewLetterTemplatePage.errorSummary.locator(
          '[href="#reviewLetterTemplateAction"]'
        );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(
        page.locator('#reviewLetterTemplateAction')
      ).toBeInViewport();
    });
  });
});
