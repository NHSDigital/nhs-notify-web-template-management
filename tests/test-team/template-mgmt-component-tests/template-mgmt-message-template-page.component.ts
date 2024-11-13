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
import { TemplateType } from '../helpers/types';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';

const templates = {
  email: TemplateFactory.create({
    type: TemplateType.EMAIL,
    id: 'valid-email-template',
    name: 'test-template-email',
    fields: {
      content: 'test example content',
    },
  }),
  'text-message': TemplateFactory.create({
    type: TemplateType.SMS,
    id: 'valid-sms-template',
    name: 'test-template-sms',
    fields: {
      content: 'test example content',
    },
  }),
  'nhs-app': TemplateFactory.create({
    type: TemplateType.NHS_APP,
    id: 'valid-nhs-app-template',
    name: 'test-template-nhs-app',
    fields: {
      content: 'test example content',
    },
  }),
};

test.describe.only('Message templates page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
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

  test('should navigate to "choose template" page when create template button is clicked', async ({
    page,
    baseURL,
  }) => {
    const messageTemplatePage = new MessageTemplatePage(page);
    await messageTemplatePage.loadPage();
    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);
    await messageTemplatePage.clickContinueButton();
    const chooseTemplatePage = await page.waitForSelector('h1');
    const headerText = await chooseTemplatePage.textContent();
    await expect(headerText).toContain('Choose a template type to create');
  });

  // to be updated:
  test('Template item has correct status if it has been has been submitted', async ({
    page,
    baseURL,
  }) => {
    const messageTemplatePage = new MessageTemplatePage(page);
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);
    await messageTemplatePage.loadPage();
    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);
    await messageTemplatePage.clickContinueButton();
    await chooseTemplatePage.checkRadioButton('NHS App message');
    await messageTemplatePage.clickContinueButton();
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await messageTemplatePage.clickContinueButton();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'NHS Testing 123'
    );
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'NHS Testing 123'
    );
    await chooseTemplatePage.checkRadioButton('Submit');
    await messageTemplatePage.clickContinueButton();
    await page.waitForTimeout(1000);
    const submittedPageHeader = await page.waitForSelector('h1');
    const headerText = await submittedPageHeader.textContent();
    await expect(headerText).toContain("Submit 'NHS Testing 123'");
    await messageTemplatePage.clickContinueButton();
    await page.waitForTimeout(3000);
    const submittedPage = await page.waitForSelector('h1');
    const submittedText = await submittedPage.textContent();
    await expect(submittedText).toContain('Template submitted');
    await messageTemplatePage.loadPage();
  });
});
