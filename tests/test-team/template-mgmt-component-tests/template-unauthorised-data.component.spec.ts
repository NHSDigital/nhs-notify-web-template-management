import { test, expect } from '@playwright/test';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { MessageTemplatesPage } from '../pages/template-mgmt-message-templates-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtPreviewSubmittedEmailPage } from '../pages/email/template-mgmt-preview-submitted-email-page';

function createTemplates(user: TestUser) {
  return {
    empty: TemplateFactory.createEmailTemplate(
      'empty-email-template',
      user,
      'empty-email-template-name'
    ),
    submit: TemplateFactory.createEmailTemplate('submit-email-template', user),
    submitAndReturn: TemplateFactory.createEmailTemplate(
      'submit-and-return-create-email-template',
      user,
      'submit-and-return-create-email-template-name'
    ),
    goBackAndReturn: TemplateFactory.createEmailTemplate(
      'go-back-email-template',
      user
    ),
    noEmailTemplateType: TemplateFactory.create({
      id: 'no-email-template-type-template',
      templateType: 'NHS_APP',
      owner: `CLIENT#${user.clientId}`,
      clientId: user.clientId,
      name: 'no-email-template-type-template-name',
    }),
    previousData: {
      ...TemplateFactory.createEmailTemplate(
        'previous-data-email-template',
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
    const messageTemplatesPage = new MessageTemplatesPage(page);
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
