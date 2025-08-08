import { test, expect } from '@playwright/test';
import { TemplateMgmtCreateNhsAppPage } from '../../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

test.describe('Create NHS App Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtCreateNhsAppPage(page),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
    await assertGoBackLink({
      ...props,
      expectedUrl: 'templates/choose-a-template-type',
    });
  });

  test('Validate error messages on the create NHS App message template page with no template name or body', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage();

    await expect(createTemplatePage.pageHeader).toHaveText(
      'Create NHS App message template'
    );
    await createTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name', 'Enter a template message']);
  });

  test('when user submits form with valid data, then the next page is displayed', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage();
    await page
      .locator('[id="nhsAppTemplateName"]')
      .fill('This is an NHS App template name');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('This is an NHS App message');
    await createTemplatePage.clickSaveAndPreviewButton();

    const previewPageRegex =
      /\/templates\/preview-nhs-app-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/;

    // eslint-disable-next-line security/detect-non-literal-regexp
    await expect(page).toHaveURL(new RegExp(previewPageRegex));

    const previewPageParts = page.url().match(previewPageRegex);
    expect(previewPageParts?.length).toEqual(2);
    templateStorageHelper.addAdHocTemplateKey({
      id: previewPageParts![1],
      owner: user.owner,
    });
  });

  test('Validate error messages on the create NHS App message template page with a no template message', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage();
    await expect(createTemplatePage.pageHeader).toHaveText(
      'Create NHS App message template'
    );
    await page.locator('[id="nhsAppTemplateName"]').fill('NHS Testing 123');
    await createTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template message']);
  });

  test('Validate error messages on the create NHS App message template page with no template name', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage();
    await expect(createTemplatePage.pageHeader).toHaveText(
      'Create NHS App message template'
    );
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await createTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name']);
  });

  test('5000 words Entered in Template body and word count correctly displayed', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage();
    await page.locator('[id="nhsAppTemplateName"]').fill('NHS Testing 123');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('T'.repeat(5000).trim());
    await expect(page.getByText('5000 of 5000 characters')).toBeVisible();
  });

  test('5001 words attempted to be entered in Template body and only 5000 allowed', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createTemplatePage.loadPage();
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
    // eslint-disable-next-line no-loop-func
    test(`when user clicks ${section} tool tip, then tool tip is displayed ${section}`, async ({
      page,
    }) => {
      const createTemplatePage = new TemplateMgmtCreateNhsAppPage(page);
      await createTemplatePage.loadPage();

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
});
