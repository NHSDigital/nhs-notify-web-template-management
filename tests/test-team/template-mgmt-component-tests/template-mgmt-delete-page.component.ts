import { test, expect } from '@playwright/test';
import { TemplateMgmtDeletePage } from '../pages/template-mgmt-delete-page';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';

const templates = {
  goBack: {
    ...TemplateFactory.createEmailTemplate('delete-page-go-back'),
    name: 'delete-page-go-back-name',
    message: 'delete-page-go-back-message',
    subject: 'template-subject',
  },
  confirm: {
    ...TemplateFactory.createEmailTemplate('delete-page-confirm'),
    name: 'delete-page-confirm-name',
    message: 'delete-page-confirm-message',
    subject: 'template-subject',
  },
};

const extraTemplateIds: string[] = [];

test.describe('Delete Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData(extraTemplateIds);
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
    await assertLoginLink(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('should go back to manage-templates page with template still visible when "no" button selected', async ({
    page,
  }) => {
    const deleteTemplatePage = new TemplateMgmtDeletePage(page);

    await deleteTemplatePage.loadPage(templates.goBack.id);

    await deleteTemplatePage.goBackButton.click();

    await expect(page).toHaveURL('/templates/manage-templates');

    await expect(page.getByText(templates.goBack.name)).toBeVisible();
  });

  test('should go back to manage-templates page with template no longer visible when "yes" button selected', async ({
    page,
  }) => {
    const deleteTemplatePage = new TemplateMgmtDeletePage(page);

    await deleteTemplatePage.loadPage(templates.confirm.id);

    await deleteTemplatePage.confirmButton.click();

    await expect(page).toHaveURL('/templates/manage-templates');

    await expect(page.getByText(templates.confirm.name)).not.toBeVisible();
  });
});
