import { test, expect, Page } from '@playwright/test';
import { loginAsUser } from '../helpers/auth/login-as-user';
import { getTestContext } from '../helpers/context/context';
import { testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { TemplateMgmtCreateNhsAppPage } from '../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { TemplateMgmtPreviewNhsAppPage } from '../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { TemplateMgmtSubmitNhsAppPage } from '../pages/nhs-app/template-mgmt-submit-nhs-app-page';
import { TemplateMgmtTemplateSubmittedNhsAppPage } from '../pages/nhs-app/template-mgmt-template-submitted-nhs-app-page';

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

  await choosePage.getTemplateTypeRadio('nhsapp').click();
  await choosePage.clickContinueButton();

  const createPage = new TemplateMgmtCreateNhsAppPage(page);

  await createPage.nameInput.fill('template-name');
  await createPage.messageTextArea.fill('template-message');
  await createPage.clickSaveAndPreviewButton();

  const previewPage = new TemplateMgmtPreviewNhsAppPage(page);

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

test('NHS App e2e test - routing disabled', async ({ page }) => {
  await runE2ETestUntilPreviewPage(page, testUsers.User2.userId);

  const previewPage = new TemplateMgmtPreviewNhsAppPage(page);

  await previewPage.submitRadioOption.click();
  await previewPage.clickContinueButton();

  const submitPage = new TemplateMgmtSubmitNhsAppPage(page);

  await expect(submitPage.pageHeading).toBeVisible();

  await submitPage.clickSubmitTemplateButton();

  const submittedPage = new TemplateMgmtTemplateSubmittedNhsAppPage(page);

  await expect(submittedPage.pageHeading).toBeVisible();
});

test('NHS App e2e test - routing enabled', async ({ page }) => {
  await runE2ETestUntilPreviewPage(page, testUsers.User1.userId);

  const previewPage = new TemplateMgmtPreviewNhsAppPage(page);

  await expect(previewPage.submitRadioOption).toBeHidden();
});
