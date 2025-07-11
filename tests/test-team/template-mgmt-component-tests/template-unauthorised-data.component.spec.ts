import { test, expect } from '@playwright/test';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { MessageTemplatesPage } from '../pages/template-mgmt-message-templates-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtPreviewSubmittedEmailPage } from '../pages/email/template-mgmt-preview-submitted-email-page';

function createTemplates(owner: string) {
  return {
    empty: TemplateFactory.createEmailTemplate(
      'empty-email-template',
      owner,
      'empty-email-template-name'
    ),
    submit: TemplateFactory.createEmailTemplate('submit-email-template', owner),
    submitAndReturn: TemplateFactory.createEmailTemplate(
      'submit-and-return-create-email-template',
      owner,
      'submit-and-return-create-email-template-name'
    ),
    goBackAndReturn: TemplateFactory.createEmailTemplate(
      'go-back-email-template',
      owner
    ),
    noEmailTemplateType: TemplateFactory.create({
      id: 'no-email-template-type-template',
      templateType: 'NHS_APP',
      owner,
      name: 'no-email-template-type-template-name',
    }),
    previousData: {
      ...TemplateFactory.createEmailTemplate(
        'previous-data-email-template',
        owner
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
    templates = createTemplates(user.userId);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });
  test('should not display templates for "User 2" on the manage template page', async ({
    page,
    baseURL,
  }) => {
    const messageTemplatesPage = new MessageTemplatesPage(page);
    await messageTemplatesPage.loadPage();
    await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);
    await expect(messageTemplatesPage.pageHeader).toHaveText(
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
    const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

    await previewEmailTemplatePage.loadPage(templates.submit.id);

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
  test('should not display be able to view/preview submitted email templates for "User 2"', async ({
    page,
    baseURL,
  }) => {
    const previewEmailTemplatePage = new TemplateMgmtPreviewSubmittedEmailPage(
      page
    );

    await previewEmailTemplatePage.loadPage(templates.submit.id);

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
