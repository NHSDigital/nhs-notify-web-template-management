import { test, expect } from '@playwright/test';
import { TemplateMgmtCreateNhsAppPage } from '../../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { TemplateFactory } from '../../helpers/template-factory';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLogoutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

const templates = {
  emptyTemplateData: TemplateFactory.createNhsAppTemplate(
    'empty-nhs-app-template'
  ),
  submit: TemplateFactory.createNhsAppTemplate('submit-nhs-app-template'),
  submitAndReturn: TemplateFactory.createNhsAppTemplate(
    'submit-and-return-nhs-app-template'
  ),
};

test.describe('Create NHS App Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

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

    await createTemplatePage.loadPage(templates.emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.emptyTemplateData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtCreateNhsAppPage(page),
      id: templates.emptyTemplateData.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertLogoutLink(props);
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

    await createTemplatePage.loadPage(templates.emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.emptyTemplateData.id}`
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

  test('when user submits form with valid data, then the next page is displayed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(templates.submit.id);
    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.submit.id}`
    );
    await page
      .locator('[id="nhsAppTemplateName"]')
      .fill('This is an NHS App template name');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('This is an NHS App message');
    await createTemplatePage.clickSubmitButton();
    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-nhs-app-template/${templates.submit.id}?from=edit`
    );
  });

  test('Validate error messages on the create NHS App message template page with a no template message', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage(templates.emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.emptyTemplateData.id}`
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

    await createTemplatePage.loadPage(templates.emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.emptyTemplateData.id}`
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

    await createTemplatePage.loadPage(templates.emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.emptyTemplateData.id}`
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

    await createTemplatePage.loadPage(templates.emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.emptyTemplateData.id}`
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
    test(`when user clicks ${section} tool tip, then tool tip is displayed ${section}`, async ({
      page,
      baseURL,
    }) => {
      const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);
      await createTemplatePage.loadPage(templates.emptyTemplateData.id);
      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-nhs-app-template/${templates.emptyTemplateData.id}`
      );

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeVisible();

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).not.toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeHidden();
    });
  }

  const moreInfoLinks = [
    {
      name: 'NHS App messages (opens in a new tab)',
      url: 'features/nhs-app-messages',
    },
    {
      name: 'Delivery times (opens in a new tab)',
      url: 'using-nhs-notify/delivery-times',
    },
    {
      name: 'Sender IDs (opens in a new tab)',
      url: 'using-nhs-notify/tell-recipients-who-your-messages-are-from',
    },
  ];

  for (const { name, url } of moreInfoLinks) {
    test(`more info link: ${name}, navigates to correct page in new tab`, async ({
      page,
      baseURL,
    }) => {
      const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createTemplatePage.loadPage();

      const newTabPromise = page.waitForEvent('popup');

      await page.getByRole('link', { name }).click();

      const newTab = await newTabPromise;

      await expect(newTab).toHaveURL(`${baseURL}/${url}`);
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
