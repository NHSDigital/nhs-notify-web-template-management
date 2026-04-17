import { test, expect, Page } from '@playwright/test';
import { loginAsUser } from '../helpers/auth/login-as-user';
import { getTestContext } from '../helpers/context/context';
import { testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { TemplateMgmtCreateEmailPage } from '../pages/email/template-mgmt-create-email-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtSubmitEmailPage } from '../pages/email/template-mgmt-submit-email-page';
import { TemplateMgmtTemplateSubmittedEmailPage } from '../pages/email/template-mgmt-template-submitted-email-page';

const templateStorageHelper = new TemplateStorageHelper();

test.afterAll(async () => {
  await templateStorageHelper.deleteAdHocTemplates();
});

// clear login state from e2e.setup.ts
test.use({ storageState: { cookies: [], origins: [] } });

const runE2ETestUntilPreviewPage = async (page: Page, userId: string) => {
  const context = getTestContext();

  const user = await context.auth.getTestUser(userId);

  await loginAsUser(user, page);

  const choosePage = new TemplateMgmtChoosePage(page);
  await choosePage.loadPage();

  await choosePage.getTemplateTypeRadio('email').click();
  await choosePage.clickContinueButton();

  const createPage = new TemplateMgmtCreateEmailPage(page);

  await createPage.nameInput.fill('template-name');
  await createPage.subjectLineInput.fill('template-subject');
  await createPage.messageTextArea.fill('template-message');
  await createPage.clickSaveAndPreviewButton();

  const previewPage = new TemplateMgmtPreviewEmailPage(page);

  await expect(previewPage.templateId).toBeVisible();

  const templateId = await previewPage.templateId.textContent();

  if (!templateId) {
    throw new Error('Could not determine template ID');
  }

  templateStorageHelper.addAdHocTemplateKey({
    clientId: user.clientId,
    templateId,
  });
};

test('Email e2e test - routing disabled', async ({ page }) => {
  await runE2ETestUntilPreviewPage(page, testUsers.User2.userId);

  const previewPage = new TemplateMgmtPreviewEmailPage(page);

  await previewPage.submitRadioOption.click();
  await previewPage.clickContinueButton();

  const submitPage = new TemplateMgmtSubmitEmailPage(page);

  await expect(submitPage.pageHeading).toBeVisible();

  await submitPage.clickSubmitTemplateButton();

  const submittedPage = new TemplateMgmtTemplateSubmittedEmailPage(page);

  await expect(submittedPage.pageHeading).toBeVisible();
});

test('Email e2e test - routing enabled', async ({ page }) => {
  await runE2ETestUntilPreviewPage(page, testUsers.User1.userId);

  const previewPage = new TemplateMgmtPreviewEmailPage(page);

  await expect(previewPage.submitRadioOption).toBeHidden();
});
