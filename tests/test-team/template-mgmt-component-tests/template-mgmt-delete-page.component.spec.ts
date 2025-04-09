import { test, expect } from '@playwright/test';
import { TemplateMgmtDeletePage } from '../pages/template-mgmt-delete-page';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    goBack: {
      ...TemplateFactory.createEmailTemplate('delete-page-go-back', owner),
      name: 'delete-page-go-back-name',
      message: 'delete-page-go-back-message',
      subject: 'template-subject',
    },
    confirmDigitial: {
      ...TemplateFactory.createEmailTemplate(
        'delete-page-confirm-email',
        owner
      ),
      name: 'delete-page-confirm-email-name',
      message: 'delete-page-confirm-email-message',
      subject: 'template-subject',
    },
    confirmLetter: {
      ...TemplateFactory.createLetterTemplate(
        'delete-page-confirm-letter',
        owner,
        'delete-page-confirm-letter-name'
      ),
    },
  };
}

test.describe('Delete Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Record<string, Template>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(TestUserId.User1);
    templates = createTemplates(user.userId);
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
    await expect(deleteTemplatePage.pageHeader).toHaveText(
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
    await assertNotifyBannerLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLinkNotPresent(props);
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

  for (const templateKey of ['confirm-digitial', 'confirm-letter']) {
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
