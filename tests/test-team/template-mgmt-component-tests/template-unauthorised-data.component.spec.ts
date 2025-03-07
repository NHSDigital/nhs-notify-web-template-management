import { test, expect } from '@playwright/test';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { TemplateType } from '../helpers/types';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { ManageTemplatesPage } from '../pages/template-mgmt-manage-templates-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtViewSubmittedEmailPage } from '../pages/email/template-mgmt-view-submitted-email-page';

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
    const user = await createAuthHelper().getTestUser(TestUserId.User2);
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
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();
    await expect(page).toHaveURL(`${baseURL}/templates/manage-templates`);
    await expect(manageTemplatesPage.pageHeader).toHaveText(
      'Message templates'
    );
    await expect(manageTemplatesPage.createTemplateButton).toBeVisible();

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
    const previewEmailTemplatePage = new TemplateMgmtViewSubmittedEmailPage(
      page
    );

    await previewEmailTemplatePage.loadPage(templates.submit.id);

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
