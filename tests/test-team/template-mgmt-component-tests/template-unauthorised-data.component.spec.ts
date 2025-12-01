import { test, expect } from '@playwright/test';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtMessageTemplatesPage } from '../pages/template-mgmt-message-templates-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtPreviewSubmittedEmailPage } from '../pages/email/template-mgmt-preview-submitted-email-page';

function createTemplates(user: TestUser) {
  return {
    empty: TemplateFactory.createEmailTemplate(
      '3636a80b-e083-443d-b6d6-c942d0eafaee',
      user,
      'empty-email-template-name'
    ),
    submit: TemplateFactory.createEmailTemplate(
      'ba569b58-9058-4a4f-a7af-eff103e04c38',
      user
    ),
    submitAndReturn: TemplateFactory.createEmailTemplate(
      'de4c9642-05e6-406a-bc1d-0104a6af455d',
      user,
      'submit-and-return-create-email-template-name'
    ),
    goBackAndReturn: TemplateFactory.createEmailTemplate(
      'd78fae9f-5cf3-4e22-8adb-9be7f35c9d1c',
      user
    ),
    previousData: {
      ...TemplateFactory.createEmailTemplate(
        'a5f0bc02-6949-4c8f-9c42-f163d62ee335',
        user
      ),
      name: 'previous-data-email-template',
      subject: 'previous-data-email-template-subject-line',
      message: 'previous-data-email-template-message',
    },
  };
}

test.describe('Unauthorised data access Tests', () => {
  let templates: ReturnType<typeof createTemplates>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User2.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });
  test('should not display templates for "User 2" on the manage template page', async ({
    page,
    baseURL,
  }) => {
    const messageTemplatesPage = new TemplateMgmtMessageTemplatesPage(page);
    await messageTemplatesPage.loadPage();
    await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);
    await expect(messageTemplatesPage.pageHeading).toHaveText(
      'Message templates'
    );
    await expect(messageTemplatesPage.createTemplateButton).toBeVisible();

    const templateRow = page.locator(
      'tr:has-text("submit-and-return-create-email-template-name")'
    );
    const templateDeleteLink = templateRow.getByText(
      'submit-and-return-create-email-template-name',
      { exact: true }
    );
    await expect(templateDeleteLink).toBeHidden();
  });

  test('should not display be able to edit email templates for "User 2"', async ({
    page,
    baseURL,
  }) => {
    const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(
      page
    ).setPathParam('templateId', templates.submit.id);

    await previewEmailTemplatePage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
  test('should not display be able to view/preview submitted email templates for "User 2"', async ({
    page,
    baseURL,
  }) => {
    const previewEmailTemplatePage = new TemplateMgmtPreviewSubmittedEmailPage(
      page
    ).setPathParam('templateId', templates.submit.id);

    await previewEmailTemplatePage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
