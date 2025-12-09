import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import {
  assertFooterLinks,
  assertAndClickBackLinkTop,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottomNotPresent,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtUploadLetterPage } from '../../pages/letter/template-mgmt-upload-letter-page';
import { TemplateMgmtUploadLetterMissingCampaignClientIdPage } from '../../pages/letter/template-mgmt-upload-letter-missing-campaign-client-id-page';
import { loginAsUser } from '../../helpers/auth/login-as-user';

test.describe('Upload letter Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();

  let user: TestUser;
  let userWithoutCampaignId: TestUser;
  let userWithMultipleCampaigns: TestUser;

  test.beforeAll(async () => {
    const authHelper = createAuthHelper();
    user = await authHelper.getTestUser(testUsers.User1.userId);
    userWithoutCampaignId = await authHelper.getTestUser(
      testUsers.User6.userId
    );
    userWithMultipleCampaigns = await authHelper.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtUploadLetterPage(page),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
    await assertBackLinkBottomNotPresent(props);
    await assertAndClickBackLinkTop({
      ...props,
      expectedUrl: 'templates/choose-a-template-type',
    });
  });

  test('Validate error messages on the upload letter template page with no template name or pdf', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await expect(createTemplatePage.pageHeading).toHaveText(
      'Upload a letter template'
    );
    await createTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name', 'Select a letter template PDF']);
  });

  test('when user with a single campaign ID submits form with valid data, then the next page is displayed', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();
    await page
      .locator('[id="letterTemplateName"]')
      .fill('This is an NHS App template name');

    await page.locator('input[name="letterTemplatePdf"]').click();
    await page
      .locator('input[name="letterTemplatePdf"]')
      .setInputFiles('./fixtures/pdf-upload/with-personalisation/template.pdf');

    await createTemplatePage.clickSaveAndPreviewButton();

    const previewPageRegex =
      /\/templates\/preview-letter-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/;

    // eslint-disable-next-line security/detect-non-literal-regexp
    await expect(page).toHaveURL(new RegExp(previewPageRegex));

    const previewPageParts = page.url().match(previewPageRegex);
    expect(previewPageParts?.length).toEqual(2);
    templateStorageHelper.addAdHocTemplateKey({
      templateId: previewPageParts![1],
      clientId: user.clientId,
    });
  });

  test.describe('campaign ID tests', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Validate error messages on the upload letter template page with no template name, campaign ID or pdf', async ({
      page,
    }) => {
      await loginAsUser(userWithMultipleCampaigns, page);

      const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

      await createTemplatePage.loadPage();

      await expect(createTemplatePage.pageHeading).toHaveText(
        'Upload a letter template'
      );
      await createTemplatePage.clickSaveAndPreviewButton();
      await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

      await expect(
        page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
      ).toHaveText([
        'Enter a template name',
        'Choose a campaign ID',
        'Select a letter template PDF',
      ]);
    });

    test('when user with a multiple campaign IDs submits form with valid data, then the next page is displayed', async ({
      page,
    }) => {
      await loginAsUser(userWithMultipleCampaigns, page);
      const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

      await createTemplatePage.loadPage();
      await page
        .locator('[id="letterTemplateName"]')
        .fill('This is an NHS App template name');

      await page.locator('input[name="letterTemplatePdf"]').click();
      await page.selectOption('#letterTemplateCampaignId', {
        value: 'other-campaign-id',
      });
      await page
        .locator('input[name="letterTemplatePdf"]')
        .setInputFiles(
          './fixtures/pdf-upload/with-personalisation/template.pdf'
        );

      await createTemplatePage.clickSaveAndPreviewButton();

      const previewPageRegex =
        /\/templates\/preview-letter-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/;

      // eslint-disable-next-line security/detect-non-literal-regexp
      await expect(page).toHaveURL(new RegExp(previewPageRegex));

      const previewPageParts = page.url().match(previewPageRegex);
      expect(previewPageParts?.length).toEqual(2);
      templateStorageHelper.addAdHocTemplateKey({
        templateId: previewPageParts![1],
        clientId: user.clientId,
      });
    });
  });

  test('Validate error messages on the upload letter template page with no PDF', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();
    await expect(createTemplatePage.pageHeading).toHaveText(
      'Upload a letter template'
    );
    await page.locator('[id="letterTemplateName"]').fill('template-name');
    await createTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Select a letter template PDF']);
  });

  const detailsSections = ['how-to-name-your-template'];

  for (const section of detailsSections) {
    // eslint-disable-next-line no-loop-func
    test(`when user clicks ${section} tool tip, then tool tip is displayed ${section}`, async ({
      page,
    }) => {
      const createTemplatePage = new TemplateMgmtUploadLetterPage(page);
      await createTemplatePage.loadPage();

      await page.getByTestId(`${section}-summary`).click();
      await expect(page.getByTestId(`${section}-details`)).toHaveAttribute(
        'open',
        ''
      );
      await expect(page.getByTestId(`${section}-text`)).toBeVisible();

      await page.getByTestId(`${section}-summary`).click();
      await expect(page.getByTestId(`${section}-details`)).not.toHaveAttribute(
        'open'
      );
      await expect(page.getByTestId(`${section}-text`)).toBeHidden();
    });
  }

  const moreInfoLinks = [
    {
      name: 'Learn how to create letter templates to our specification (opens in a new tab)',
      url: 'using-nhs-notify/upload-a-letter',
    },
    {
      name: 'Learn how to provide example personalisation data (opens in a new tab)',
      url: 'using-nhs-notify/personalisation#providing-example-data',
    },
  ];

  for (const { name, url } of moreInfoLinks) {
    test(`more info link: ${name}, navigates to correct page in new tab`, async ({
      page,
      baseURL,
    }) => {
      const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

      await createTemplatePage.loadPage();

      const newTabPromise = page.waitForEvent('popup');

      await page.getByRole('link', { name }).click();

      const newTab = await newTabPromise;

      await expect(newTab).toHaveURL(`${baseURL}/${url}`);
    });
  }

  test.describe('missing campaign ID error page', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('redirects to error page when campaign ID is missing', async ({
      page,
    }) => {
      await loginAsUser(userWithoutCampaignId, page);

      const createTemplatePage = new TemplateMgmtUploadLetterPage(page);
      const missingClientOrCampaignIdErrorPage =
        new TemplateMgmtUploadLetterMissingCampaignClientIdPage(page);

      await createTemplatePage.loadPage();

      await expect(page).toHaveURL(missingClientOrCampaignIdErrorPage.getUrl());

      await assertMissingClientOrCampaignIdErrorPage(
        missingClientOrCampaignIdErrorPage
      );
    });
  });

  const assertMissingClientOrCampaignIdErrorPage = async (
    page: TemplateMgmtUploadLetterMissingCampaignClientIdPage
  ) => {
    await expect(page.heading).toHaveText(
      'You cannot create letter templates yet'
    );
    await expect(page.errorDetailsInsetText).toHaveText(
      'Account needs a client ID and campaign ID'
    );

    await expect(page.backLinkBottom).toHaveText('Go back');
    await expect(page.backLinkBottom).toHaveAttribute(
      'href',
      '/templates/choose-a-template-type'
    );
  };
});
