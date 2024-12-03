import { test, expect } from '@playwright/test';
import { MessageTemplatePage } from '../pages/template-mgmt-message-template-page';
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
  email: TemplateFactory.create({
    id: 'valid-email-template',
    version: 1,
    name: 'test-template-cat-email',
    message: 'test example message',
    subject: 'test example subject',
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.SUBMITTED,
  }),
  'text-message': TemplateFactory.create({
    id: 'valid-sms-template',
    name: 'test-template-mat-sms',
    message: 'test example message',
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.SUBMITTED,
  }),
  'nhs-app': TemplateFactory.create({
    id: 'valid-nhs-app-template',
    name: 'test-template-hat-nhs-app',
    message: 'test example message',
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.SUBMITTED,
  }),
};

test.describe('Message templates page', () => {
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
      page: new MessageTemplatePage(page),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertLoginLink(props);
    await assertFooterLinks(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('should navigate to the Message templates page', async ({
    page,
    baseURL,
  }) => {
    const messageTemplatePage = new MessageTemplatePage(page);
    await messageTemplatePage.loadPage();
    await expect(page).toHaveURL(`${baseURL}/templates/manage-templates`);
    expect(await messageTemplatePage.pageHeader.textContent()).toBe(
      'Message templates'
    );
    expect(await messageTemplatePage.createTemplateButton).toBeVisible();
  });

  test('Template item has correct status if it has been has been submitted', async ({
    page,
    baseURL,
  }) => {
    const messageTemplatePage = new MessageTemplatePage(page);
    await messageTemplatePage.loadPage();

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);

    const email = await page.locator('tr:has-text("test-template-cat-email")');
    await expect(await email.getByText('Submitted')).toBeVisible();

    const sms = await page.locator('tr:has-text("test-template-mat-sms")');
    await expect(await sms.getByText('Submitted')).toBeVisible();

    const nhsapp = await page.locator(
      'tr:has-text("test-template-hat-nhs-app")'
    );
    await expect(await nhsapp.getByText('Submitted')).toBeVisible();
  });

  test('should navigate to "choose template" page when create template button is clicked', async ({
    page,
    baseURL,
  }) => {
    const messageTemplatePage = new MessageTemplatePage(page);
    await messageTemplatePage.loadPage();
    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);
    expect(await messageTemplatePage.pageHeader.textContent()).toBe(
      'Message templates'
    );
    expect(await messageTemplatePage.createTemplateButton).toBeVisible();
    await messageTemplatePage.clickCreateTemplateButton();
    const chooseTemplatePage = await page.waitForSelector('h1');
    const headerText = await chooseTemplatePage.textContent();
    await expect(headerText).toContain('Choose a template type to create');
  });

  // test placeholders:
  test('Template name link navigation - navigates to preview page', async () => {});

  test('Copy link navigation - Navigates user to duplicate template type page ', async () => {});

  test('Delete link navigation - Navigates user to delete template page ', async () => {});
});
