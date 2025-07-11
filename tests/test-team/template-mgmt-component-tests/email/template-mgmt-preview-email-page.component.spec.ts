import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewEmailPage } from '../../pages/email/template-mgmt-preview-email-page';
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
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
  return {
    empty: {
      id: 'preview-page-invalid-email-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'EMAIL',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: user.userId,
    } as Template,
    valid: {
      ...TemplateFactory.createEmailTemplate(
        'valid-email-preview-template',
        user.userId
      ),
      name: 'test-template-email',
      subject: 'test-template-subject-line',
      message: 'test-template-message',
    },
  };
}

test.describe('Preview Email message template Page', () => {
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
    const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

    await previewEmailTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-email-template/${templates.valid.id}`
    );

    await expect(previewEmailTemplatePage.pageHeader).toContainText(
      'test-template-email'
    );

    await expect(previewEmailTemplatePage.subjectLineText).toHaveText(
      'test-template-subject-line'
    );

    await expect(previewEmailTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewEmailPage(page),
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

    test('when user submits form with "Edit" data, then the "Create email message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.editRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-email-template/${templates.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.submitRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-email-template/${templates.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.clickContinueButton();

      await expect(previewEmailTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink =
        previewEmailTemplatePage.errorSummary.locator(
          '[href="#previewEmailTemplateAction"]'
        );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(
        page.locator('#previewEmailTemplateAction')
      ).toBeInViewport();
    });
  });
});
