import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto'
import { ManageTemplatesPage } from '../pages/template-mgmt-manage-templates-page';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateFactory } from '../helpers/template-factory';
import { TemplateStatus, TemplateType } from '../helpers/types';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';

const templates = {
  emailSubmitted: TemplateFactory.create({
    id: randomUUID(),
    version: 1,
    name: 'email-submitted_manage-templates-page',
    message: 'test example message',
    subject: 'test example subject',
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.SUBMITTED,
    createdAt: '2010-10-11T11:11:11.111Z',
  }),
  emailNotYetSubmitted: TemplateFactory.create({
    id: randomUUID(),
    version: 1,
    name: 'email-not-yet-submitted_manage-templates-page',
    message: 'test example message',
    subject: 'test example subject',
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    createdAt: '2010-10-11T10:10:10.100Z',
  }),
  smsSubmitted: TemplateFactory.create({
    id: randomUUID(),
    name: 'sms-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.SUBMITTED,
    createdAt: '2010-10-10T11:11:11.111Z',
  }),
  smsNotYetSubmitted: TemplateFactory.create({
    id: randomUUID(),
    name: 'sms-not-yet-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    createdAt: '2010-10-10T10:10:10.100Z',
  }),
  nhsAppSubmitted: TemplateFactory.create({
    id: randomUUID(),
    name: 'nhs-app-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.SUBMITTED,
    createdAt: '2010-10-09T11:11:11.111Z',
  }),
  nhsAppNotYetSubmitted: TemplateFactory.create({
    id: randomUUID(),
    name: 'nhs-app-not-yet-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    createdAt: '2010-10-09T10:10:10.100Z',
  }),
};

test.describe('Manage templates page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new ManageTemplatesPage(page),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertLoginLink(props);
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
    await expect(manageTemplatesPage.pageHeader).toHaveText('Message templates')
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
    await expect(manageTemplatesPage.pageHeader).toHaveText('Message templates')
    expect(manageTemplatesPage.createTemplateButton).toBeVisible();
    await manageTemplatesPage.clickCreateTemplateButton();
    const chooseTemplatePage = await page.waitForSelector('h1');
    const headerText = await chooseTemplatePage.textContent();
    expect(headerText).toContain('Choose a template type to create');
  });

  test('Name link navigation - navigates to preview page', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const templatePreviewLink = page.getByText(
      'email-not-yet-submitted_manage-templates-page'
    );

    // This will break and need updating during CCM-7649
    expect(templatePreviewLink).toHaveAttribute('href', '#');
    await templatePreviewLink.click();
    await expect(page).toHaveURL(new RegExp('/templates/manage-templates'));
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
    const templateCopyLink = templateRow.getByText('Copy', { exact: true });

    // This will break and need updating during CCM-5539
    expect(templateCopyLink).toHaveAttribute('href', '#');
    await templateCopyLink.click();
    await expect(page).toHaveURL(new RegExp('/templates/manage-templates'));
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

    // This will break and need updating during CCM-7572
    expect(templateDeleteLink).toHaveAttribute('href', '#');
    await templateDeleteLink.click();
    await expect(page).toHaveURL(new RegExp('/templates/manage-templates'));
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
