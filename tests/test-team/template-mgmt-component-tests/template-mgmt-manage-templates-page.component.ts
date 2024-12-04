import { test, expect } from '@playwright/test';
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
import { v4 as uuid } from 'uuid';

const templates = {
  emailSubmitted: TemplateFactory.create({
    id: uuid(),
    version: 1,
    name: 'email-submitted_manage-templates-page',
    message: 'test example message',
    subject: 'test example subject',
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.SUBMITTED,
  }),
  emailNotYetSubmitted: TemplateFactory.create({
    id: uuid(),
    version: 1,
    name: 'email-not-yet-submitted_manage-templates-page',
    message: 'test example message',
    subject: 'test example subject',
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  }),
  smsSubmitted: TemplateFactory.create({
    id: uuid(),
    name: 'sms-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.SUBMITTED,
  }),
  smsNotYetSubmitted: TemplateFactory.create({
    id: uuid(),
    name: 'sms-not-yet-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.SUBMITTED,
  }),
  nhsAppSubmitted: TemplateFactory.create({
    id: uuid(),
    name: 'nhs-app-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.SUBMITTED,
  }),
  nhsAppNotYetSubmitted: TemplateFactory.create({
    id: uuid(),
    name: 'nhs-app-not-yet-submitted_manage-templates-page',
    message: 'test example message',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
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
    expect(await manageTemplatesPage.pageHeader.textContent()).toBe(
      'Message templates'
    );
    expect(await manageTemplatesPage.createTemplateButton).toBeVisible();
  });

  test('Submitted template items have correct status indicator', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const emailSubmitted = await page.locator('tr:has-text("email-submitted_manage-templates-page")');
    await expect(await emailSubmitted.getByText('Submitted', { exact: true })).toBeVisible();

    const smsSubmitted = await page.locator('tr:has-text("sms-submitted_manage-templates-page")');
    await expect(await smsSubmitted.getByText('Submitted', { exact: true })).toBeVisible();

    const nhsapp = await page.locator('tr:has-text("nhs-app-submitted_manage-templates-page")');
    await expect(await nhsapp.getByText('Submitted', { exact: true })).toBeVisible();
  });

  test('Not Yet Submitted template items have correct status indicator', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const email = await page.locator('tr:has-text("email-not-yet-submitted_manage-templates-page")');
    await expect(await email.getByText('Not yet submitted', { exact: true })).toBeVisible();

    const sms = await page.locator('tr:has-text("sms-not-yet-submitted_manage-templates-page")');
    await expect(await sms.getByText('Not yet submitted', { exact: true })).toBeVisible();

    const nhsapp = await page.locator('tr:has-text("nhs-app-not-yet-submitted_manage-templates-page")');
    await expect(await nhsapp.getByText('Not yet submitted', { exact: true })).toBeVisible();
  });

  test('should navigate to "choose template" page when create template button is clicked', async ({
    page,
    baseURL,
  }) => {
    const manageTemplatesPage = new ManageTemplatesPage(page);
    await manageTemplatesPage.loadPage();
    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);
    expect(await manageTemplatesPage.pageHeader.textContent()).toBe(
      'Message templates'
    );
    expect(await manageTemplatesPage.createTemplateButton).toBeVisible();
    await manageTemplatesPage.clickCreateTemplateButton();
    const chooseTemplatePage = await page.waitForSelector('h1');
    const headerText = await chooseTemplatePage.textContent();
    await expect(headerText).toContain('Choose a template type to create');
  });

  // test placeholders:
  test('Template name link navigation - navigates to preview page', async () => { });

  test('Copy link navigation - Navigates user to duplicate template type page ', async () => { });

  test('Delete link navigation - Navigates user to delete template page ', async () => { });
});
