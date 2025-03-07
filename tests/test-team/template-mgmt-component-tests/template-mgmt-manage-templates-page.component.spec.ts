import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { ManageTemplatesPage } from '../pages/template-mgmt-manage-templates-page';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template, TemplateStatus, TemplateType } from '../helpers/types';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    emailSubmitted: TemplateFactory.create({
      id: randomUUID(),
      owner,
      version: 1,
      name: 'email-submitted_manage-templates-page',
      message: 'test example message',
      subject: 'test example subject',
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
      createdAt: '2010-10-11T11:11:11.111Z',
    }),
    emailNotYetSubmitted: TemplateFactory.create({
      id: randomUUID(),
      owner,
      version: 1,
      name: 'email-not-yet-submitted_manage-templates-page',
      message: 'test example message',
      subject: 'test example subject',
      templateType: 'EMAIL',
      templateStatus: 'NOT_YET_SUBMITTED',
      createdAt: '2010-10-11T10:10:10.100Z',
    }),
    smsSubmitted: TemplateFactory.create({
      id: randomUUID(),
      owner,
      name: 'sms-submitted_manage-templates-page',
      message: 'test example message',
      templateType: 'SMS',
      templateStatus: 'SUBMITTED',
      createdAt: '2010-10-10T11:11:11.111Z',
    }),
    smsNotYetSubmitted: TemplateFactory.create({
      id: randomUUID(),
      owner,
      name: 'sms-not-yet-submitted_manage-templates-page',
      message: 'test example message',
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      createdAt: '2010-10-10T10:10:10.100Z',
    }),
    nhsAppSubmitted: TemplateFactory.create({
      id: randomUUID(),
      owner,
      name: 'nhs-app-submitted_manage-templates-page',
      message: 'test example message',
      templateType: 'NHS_APP',
      templateStatus: 'SUBMITTED',
      createdAt: '2010-10-09T11:11:11.111Z',
    }),
    nhsAppNotYetSubmitted: TemplateFactory.create({
      id: randomUUID(),
      owner,
      name: 'nhs-app-not-yet-submitted_manage-templates-page',
      message: 'test example message',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      createdAt: '2010-10-09T10:10:10.100Z',
    }),
  };
}

test.describe('Manage templates page', () => {
  let templates: Record<string, Template>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(TestUserId.User1);
    templates = createTemplates(user.userId);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new ManageTemplatesPage(page),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('should navigate to the manage templates page', async ({
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
  });

  test('Submitted template items have correct status indicator', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const email = page.locator(
      'tr:has-text("email-submitted_manage-templates-page")'
    );
    await expect(email.getByText('Submitted', { exact: true })).toBeVisible();

    const sms = page.locator(
      'tr:has-text("sms-submitted_manage-templates-page")'
    );
    await expect(sms.getByText('Submitted', { exact: true })).toBeVisible();

    const nhsapp = page.locator(
      'tr:has-text("nhs-app-submitted_manage-templates-page")'
    );
    await expect(nhsapp.getByText('Submitted', { exact: true })).toBeVisible();
  });

  test('Not Yet Submitted template items have correct status indicator', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const email = page.locator(
      'tr:has-text("email-not-yet-submitted_manage-templates-page")'
    );
    await expect(
      email.getByText('Not yet submitted', { exact: true })
    ).toBeVisible();

    const sms = page.locator(
      'tr:has-text("sms-not-yet-submitted_manage-templates-page")'
    );
    await expect(
      sms.getByText('Not yet submitted', { exact: true })
    ).toBeVisible();

    const nhsapp = page.locator(
      'tr:has-text("nhs-app-not-yet-submitted_manage-templates-page")'
    );
    await expect(
      nhsapp.getByText('Not yet submitted', { exact: true })
    ).toBeVisible();
  });

  test('should navigate to "choose template" page when create template button is clicked', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();
    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);
    await expect(manageTemplatesPage.pageHeader).toHaveText(
      'Message templates'
    );
    await expect(manageTemplatesPage.createTemplateButton).toBeVisible();
    await manageTemplatesPage.clickCreateTemplateButton();
    await expect(page).toHaveURL('/templates/choose-a-template-type');
  });

  test('Name link - not-yet-submitted template navigates to preview page', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const templatePreviewLink = page.getByText(
      'email-not-yet-submitted_manage-templates-page'
    );

    await expect(templatePreviewLink).toHaveAttribute(
      'href',
      `/templates/preview-email-template/${templates.emailNotYetSubmitted.id}`
    );
    await templatePreviewLink.click();
    await expect(page).toHaveURL(
      new RegExp('/templates/preview-email-template/')
    );
  });

  test('Name link - submitted template navigates to view submitted page', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const templatePreviewLink = page.getByText(
      'email-submitted_manage-templates-page'
    );

    await expect(templatePreviewLink).toHaveAttribute(
      'href',
      `/templates/view-submitted-email-template/${templates.emailSubmitted.id}`
    );
    await templatePreviewLink.click();
    await expect(page).toHaveURL(
      new RegExp('/templates/view-submitted-email-template/')
    );
  });

  test('Copy link navigation - navigates user to duplicate template type page', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const templateRow = page.locator(
      'tr:has-text("email-submitted_manage-templates-page")'
    );
    const templateCopyLink = templateRow.getByText('Copy');

    await expect(templateCopyLink).toHaveAttribute(
      'href',
      `/templates/copy-template/${templates.emailSubmitted.id}`
    );
    await templateCopyLink.click();
    await expect(page).toHaveURL(
      new RegExp(`/templates/copy-template/${templates.emailSubmitted.id}`) // eslint-disable-line security/detect-non-literal-regexp
    );
  });

  test('Delete link navigation - navigates user to delete template page', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const templateRow = page.locator(
      'tr:has-text("email-not-yet-submitted_manage-templates-page")'
    );
    const templateDeleteLink = templateRow.getByText('Delete', { exact: true });

    const deleteTemplateURL = `/templates/delete-template/${templates.emailNotYetSubmitted.id}`;
    await expect(templateDeleteLink).toHaveAttribute('href', deleteTemplateURL);
    await templateDeleteLink.click();
    await expect(page).toHaveURL(new RegExp(deleteTemplateURL)); // eslint-disable-line security/detect-non-literal-regexp
  });

  test('Delete link not present for submitted templates', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const templateRow = page.locator(
      'tr:has-text("email-submitted_manage-templates-page")'
    );
    const templateDeleteLink = templateRow.getByText('Delete', { exact: true });
    await expect(templateDeleteLink).toBeHidden();
  });

  test('templates are ordered by createdAt descending', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const expectedOrder = [
      'email-submitted_manage-templates-page',
      'email-not-yet-submitted_manage-templates-page',
      'sms-submitted_manage-templates-page',
      'sms-not-yet-submitted_manage-templates-page',
      'nhs-app-submitted_manage-templates-page',
      'nhs-app-not-yet-submitted_manage-templates-page',
    ];

    const rows = page.locator('tr');
    const rowCount = await rows.count();

    const actualOrder = await Promise.all(
      Array.from({ length: rowCount }, async (_, i) => {
        const anchorLocator = rows.nth(i).locator('td:first-child a');
        const anchorCount = await anchorLocator.count();

        if (anchorCount > 0) {
          const anchorText = await anchorLocator.textContent();
          if (
            anchorText &&
            expectedOrder.some((expected) => anchorText.includes(expected))
          ) {
            return anchorText.trim();
          }
        }
        return null;
      })
    );

    expect(actualOrder.filter(Boolean)).toEqual(expectedOrder);
  });
});
