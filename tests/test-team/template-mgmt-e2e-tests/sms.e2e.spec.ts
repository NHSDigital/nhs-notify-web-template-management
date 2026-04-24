import { test, expect, Page } from '@playwright/test';
import { loginAsUser } from '../helpers/auth/login-as-user';
import { getTestContext } from '../helpers/context/context';
import { testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { TemplateMgmtCreateSmsPage } from '../pages/sms/template-mgmt-create-sms-page';
import { TemplateMgmtPreviewSmsPage } from '../pages/sms/template-mgmt-preview-sms-page';
import { TemplateMgmtSubmitSmsPage } from '../pages/sms/template-mgmt-submit-sms-page';
import { TemplateMgmtTemplateSubmittedSmsPage } from '../pages/sms/template-mgmt-template-submitted-sms-page';

const templateStorageHelper = new TemplateStorageHelper();

test.afterAll(async () => {
  await templateStorageHelper.deleteAdHocTemplates();
});

// clear login state from e2e.setup.ts
test.use({ storageState: { cookies: [], origins: [] } });

const createAndPreviewSmsTemplate = async (page: Page, userId: string) => {
  const context = getTestContext();

  const user = await context.auth.getTestUser(userId);

  await loginAsUser(user, page);

  const choosePage = new TemplateMgmtChoosePage(page);
  await choosePage.loadPage();

  await choosePage.getTemplateTypeRadio('sms').click();
  await choosePage.clickContinueButton();

  const createPage = new TemplateMgmtCreateSmsPage(page);

  await createPage.nameInput.fill('template-name');
  await createPage.messageTextArea.fill('template-message');
  await createPage.clickSaveAndPreviewButton();

  const previewPage = new TemplateMgmtPreviewSmsPage(page);

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

test('SMS e2e test - routing disabled', async ({ page }) => {
  await createAndPreviewSmsTemplate(page, testUsers.User2.userId);

  const previewPage = new TemplateMgmtPreviewSmsPage(page);

  await previewPage.submitRadioOption.click();
  await previewPage.clickContinueButton();

  const submitPage = new TemplateMgmtSubmitSmsPage(page);

  await expect(submitPage.pageHeading).toBeVisible();

  await submitPage.clickSubmitTemplateButton();

  const submittedPage = new TemplateMgmtTemplateSubmittedSmsPage(page);

  await expect(submittedPage.pageHeading).toBeVisible();
});

test('SMS e2e test - routing enabled', async ({ page }) => {
  await createAndPreviewSmsTemplate(page, testUsers.User1.userId);

  const previewPage = new TemplateMgmtPreviewSmsPage(page);

  await expect(previewPage.submitRadioOption).toBeHidden();
});
