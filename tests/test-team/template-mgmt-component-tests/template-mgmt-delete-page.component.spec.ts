import { test, expect } from '@playwright/test';
import { TemplateMgmtDeletePage } from '../pages/template-mgmt-delete-page';
import {
  assertFooterLinks,
  assertNoBackLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../helpers/template-mgmt-common.steps';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    goBack: {
      ...TemplateFactory.createEmailTemplate(
        '21a27db7-5cb1-4349-a45d-d3679179ee3a',
        user
      ),
      name: 'delete-page-go-back-name',
      message: 'delete-page-go-back-message',
      subject: 'template-subject',
    },
    confirmDigitial: {
      ...TemplateFactory.createEmailTemplate(
        'c4886dd0-9d84-4968-9af1-5081966b7806',
        user
      ),
      name: 'delete-page-confirm-email-name',
      message: 'delete-page-confirm-email-message',
      subject: 'template-subject',
    },
    confirmLetter: TemplateFactory.uploadLetterTemplate(
      '7bf812d1-7469-4623-92a9-c5db4289a4cb',
      user,
      'delete-page-confirm-letter-name'
    ),
  };
}

test.describe('Delete Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Record<string, Template>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('should land on "Delete Template" page when navigating to "/delete-template" url', async ({
    page,
    baseURL,
  }) => {
    const deleteTemplatePage = new TemplateMgmtDeletePage(page);

    await deleteTemplatePage.loadPage(templates.goBack.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/delete-template/${templates.goBack.id}`
    );
    await expect(deleteTemplatePage.pageHeading).toHaveText(
      `Are you sure you want to delete the template '${templates.goBack.name}'?`
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtDeletePage(page),
      id: templates.goBack.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertNoBackLinks(props);
  });

  test('should go back to message-templates page with template still visible when "no" button selected', async ({
    page,
  }) => {
    const deleteTemplatePage = new TemplateMgmtDeletePage(page);

    await deleteTemplatePage.loadPage(templates.goBack.id);

    await deleteTemplatePage.goBackButton.click();

    await expect(page).toHaveURL('/templates/message-templates');

    await expect(page.getByText(templates.goBack.name)).toBeVisible();
  });

  for (const templateKey of ['confirmDigitial', 'confirmLetter']) {
    test(`should go back to message-templates page with template "${templateKey}" no longer visible when "yes" button selected`, async ({
      page,
    }) => {
      const deleteTemplatePage = new TemplateMgmtDeletePage(page);

      await deleteTemplatePage.loadPage(templates[templateKey].id);

      await deleteTemplatePage.confirmButton.click();

      await expect(page).toHaveURL('/templates/message-templates');

      await expect(page.getByText(templates[templateKey].name)).toBeHidden();
    });
  }
});
