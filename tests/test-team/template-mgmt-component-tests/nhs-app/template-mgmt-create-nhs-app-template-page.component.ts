import { test, expect } from '@playwright/test';
import { TemplateMgmtCreateNhsAppPage } from '../../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { Template, TemplateType, TemplateStatus } from '../../helpers/types';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

export const emptyTemplateData: Template = {
  __typename: 'TemplateStorage',
  id: '3d98b0c4-6666-0000-1111-95eb27590000',
  version: 1,
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: '',
  message: '',
};

export const emptyTemplateForTemplateCreation: Template = {
  __typename: 'TemplateStorage',
  id: '4d98b0c4-7777-0000-1111-95eb27590011',
  version: 1,
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: '',
  message: '',
};

test.describe('Create NHS App Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper([
    emptyTemplateData,
    emptyTemplateForTemplateCreation,
  ]);

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
  });

  test('should navigate to the NHS App template creation page when radio button selected', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtCreateNhsAppPage(page),
      id: emptyTemplateData.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertLoginLink(props);
    await assertFooterLinks(props);
    await assertGoBackLink({
      ...props,
      expectedUrl: 'templates/choose-a-template-type',
    });
  });

  test('Validate error messages on the create NHS App message template page with no template name or body', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    await createTemplatePage.clickSubmitButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name', 'Enter a template message']);
  });

  test('NHS App Message template populated and continued to the preview screen displayed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(emptyTemplateForTemplateCreation.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateForTemplateCreation.id}`
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await createTemplatePage.clickSubmitButton();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'NHS Testing 123'
    );
  });

  test('Validate error messages on the create NHS App message template page with a no template message', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    await createTemplatePage.clickSubmitButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template message']);
  });

  test('Validate error messages on the create NHS App message template page with no template name', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await createTemplatePage.clickSubmitButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name']);
  });

  test('5000 words Entered in Template body and word count correctly displayed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(emptyTemplateForTemplateCreation.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateForTemplateCreation.id}`
    );
    await page.locator('[id="nhsAppTemplateName"]').fill('NHS Testing 123');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('T'.repeat(5000).trim());
    await expect(page.getByText('5000 of 5000 characters')).toBeVisible();
  });

  test('5001 words attempted to be entered in Template body and only 5000 allowed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(emptyTemplateForTemplateCreation.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateForTemplateCreation.id}`
    );

    await page.locator('[id="nhsAppTemplateName"]').fill('NHS Testing 123');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('T'.repeat(5001).trim());
    await expect(page.getByText('5000 of 5000 characters')).toBeVisible();

    const messageContent = await page
      .getByRole('textbox', { name: 'Message' })
      .textContent();

    expect(messageContent).toHaveLength(5000);
  });

  const detailsSections = [
    '[data-testid="personalisation-details"]',
    '[data-testid="lines-breaks-and-paragraphs-details"]',
    '[data-testid="headings-details"]',
    '[data-testid="bold-text-details"]',
    '[data-testid="link-and-url-details"]',
    '[data-testid="how-to-name-your-template"]',
  ];

  for (const section of detailsSections) {
    test(`personalisation mark expanding fields for ${section}`, async ({
      page,
      baseURL,
    }) => {
      const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);
      await createTemplatePage.loadPage(emptyTemplateData.id);
      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-nhs-app-template/${emptyTemplateData.id}`
      );

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeVisible();

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).not.toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeHidden();
    });
  }

  test('Invalid template ID test', async ({ page, baseURL }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);
    const invalidTemplateId = 'invalid-template-id';
    await createTemplatePage.loadPage(invalidTemplateId);
    const errorMessage = page.locator('.nhsuk-heading-xl');
    await Promise.all([
      expect(errorMessage).toBeVisible(),
      expect(errorMessage).toHaveText('Sorry, we could not find that page'),
      expect(page).toHaveURL(`${baseURL}/templates/invalid-template`),
    ]);
  });
});
