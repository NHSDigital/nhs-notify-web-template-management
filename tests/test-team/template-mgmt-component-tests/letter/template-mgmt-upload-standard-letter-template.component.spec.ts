import { test, expect } from '@playwright/test';
import { docxFixtures } from 'fixtures/letters';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';
import {
  assertAndClickBackLinkTop,
  assertBackLinkBottomNotPresent,
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { TemplateMgmtUploadStandardLetterTemplatePage } from 'pages/letter/template-mgmt-upload-standard-letter-template-page';

let userNoCampaignId: TestUser;
let userSingleCampaign: TestUser;
let userMultipleCampaigns: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();

  userSingleCampaign = await authHelper.getTestUser(testUsers.User1.userId);
  userNoCampaignId = await authHelper.getTestUser(testUsers.User6.userId);
  userMultipleCampaigns = await authHelper.getTestUser(
    testUsers.UserWithMultipleCampaigns.userId
  );
});

test.describe('Upload Standard Letter Template Page', () => {
  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtUploadStandardLetterTemplatePage(page),
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

  test.describe('single campaign client', () => {
    test('no validation errors when form is submitted', async ({ page }) => {
      const uploadPage = new TemplateMgmtUploadStandardLetterTemplatePage(page);

      await uploadPage.loadPage();

      await expect(uploadPage.campaignIdInput).toBeHidden();
      await expect(uploadPage.singleCampaignIdText).toHaveText(
        userSingleCampaign.campaignIds?.[0] as string
      );

      await uploadPage.nameInput.fill('New Letter Template');

      await uploadPage.fileInput.click();
      await uploadPage.fileInput.setInputFiles(docxFixtures.standard.filepath);

      await uploadPage.submitButton.click();

      // TODO: CCM-14211 - test submit behaviour

      await expect(uploadPage.errorSummaryList).toBeHidden();
    });

    test('displays error messages when blank form is submitted', async ({
      page,
    }) => {
      const uploadPage = new TemplateMgmtUploadStandardLetterTemplatePage(page);

      await uploadPage.loadPage();

      await expect(uploadPage.errorSummaryList).toBeHidden();

      await uploadPage.submitButton.click();

      await expect(uploadPage.errorSummaryList).toHaveText([
        'Enter a template name',
        'Choose a template file',
      ]);
    });
  });

  test.describe('multi-campaign client', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userMultipleCampaigns, page);
    });

    test('no validation errors when form is submitted', async ({ page }) => {
      const uploadPage = new TemplateMgmtUploadStandardLetterTemplatePage(page);

      await uploadPage.loadPage();

      await uploadPage.nameInput.fill('New Letter Template');

      await expect(uploadPage.singleCampaignIdText).toBeHidden();
      await uploadPage.campaignIdInput.selectOption(
        userMultipleCampaigns.campaignIds?.[0] as string
      );

      await uploadPage.fileInput.click();
      await uploadPage.fileInput.setInputFiles(docxFixtures.standard.filepath);

      await uploadPage.submitButton.click();

      // TODO: CCM-14211 - test submit behaviour

      await expect(uploadPage.errorSummaryList).toBeHidden();
    });

    test('displays error messages when blank form is submitted', async ({
      page,
    }) => {
      const uploadPage = new TemplateMgmtUploadStandardLetterTemplatePage(page);

      await uploadPage.loadPage();

      await expect(uploadPage.errorSummaryList).toBeHidden();

      await uploadPage.submitButton.click();

      await expect(uploadPage.errorSummaryList).toHaveText([
        'Enter a template name',
        'Choose a campaign',
        'Choose a template file',
      ]);
    });
  });

  test.describe('client has no campaign id', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userNoCampaignId, page);
    });

    test('redirects to invalid config page', async ({ page }) => {
      const uploadPage = new TemplateMgmtUploadStandardLetterTemplatePage(page);

      await uploadPage.loadPage();

      await expect(page).toHaveURL(
        '/templates/upload-letter-template/client-id-and-campaign-id-required'
      );
    });
  });
});
