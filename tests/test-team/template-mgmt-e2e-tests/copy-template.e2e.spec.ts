import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth/login-as-user';
import { getTestContext } from '../helpers/context/context';
import { testUsers } from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { TemplateMgmtCreateNhsAppPage } from '../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { TemplateMgmtPreviewNhsAppPage } from '../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { TemplateMgmtMessageTemplatesPage } from '../pages/template-mgmt-message-templates-page';
import { TemplateMgmtCopyPage } from '../pages/template-mgmt-copy-page';

const templateStorageHelper = new TemplateStorageHelper();

test.afterAll(async () => {
  await templateStorageHelper.deleteAdHocTemplates();
});

// clear login state from e2e.setup.ts
test.use({ storageState: { cookies: [], origins: [] } });

test('Copy app template e2e test', async ({ page }) => {
  const testStart = Date.now();

  const templateName = `template-name ${testStart}`;

  const context = getTestContext();

  const user = await context.auth.getTestUser(testUsers.User1.userId);

  await loginAsUser(user, page);

  const choosePage = new TemplateMgmtChoosePage(page);
  await choosePage.loadPage();

  await choosePage.getTemplateTypeRadio('nhsapp').click();
  await choosePage.clickContinueButton();

  const createPage = new TemplateMgmtCreateNhsAppPage(page);

  await createPage.nameInput.fill(templateName);
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

  await previewPage.clickBackLinkTop();

  const messageTemplatesPage = new TemplateMgmtMessageTemplatesPage(page);

  await messageTemplatesPage.copyTemplate(templateId);

  const copyTemplatePage = new TemplateMgmtCopyPage(page);

  await copyTemplatePage.checkRadioButton('NHS App message');

  await copyTemplatePage.clickContinueButton();

  await expect(
    page.getByText('Message templates', { exact: true })
  ).toBeVisible();

  await expect(async () => {
    // reload because sometimes message templates page can load before the DB update is persisted
    await page.reload();

    await expect(
      page.getByText(
        new RegExp( // eslint-disable-line security/detect-non-literal-regexp
          `COPY \\([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\\): ${templateName}`
        )
      )
    ).toBeVisible();
  }).toPass({ timeout: 30_000 });
});
