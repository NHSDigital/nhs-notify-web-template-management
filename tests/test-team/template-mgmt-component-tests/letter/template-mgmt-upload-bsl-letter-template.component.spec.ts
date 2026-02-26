import { test, expect } from '@playwright/test';
import { docxFixtures } from 'fixtures/letters';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';
import { loginAsUser } from 'helpers/auth/login-as-user';
import {
  assertAndClickBackLinkTop,
  assertBackLinkBottomNotPresent,
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { TemplateMgmtUploadBSLLetterTemplatePage } from 'pages/letter/template-mgmt-upload-bsl-letter-template-page';

let userNoCampaignId: TestUser;
let userSingleCampaign: TestUser;
let userMultipleCampaigns: TestUser;
let userAuthoringDisabled: TestUser;

test.beforeAll(async () => {
  const context = getTestContext();

  userSingleCampaign = await context.auth.getTestUser(
    testUsers.UserLetterAuthoringEnabled.userId
  );
  userNoCampaignId = await context.auth.getTestUser(testUsers.User6.userId);
  userMultipleCampaigns = await context.auth.getTestUser(
    testUsers.UserWithMultipleCampaigns.userId
  );
  userAuthoringDisabled = await context.auth.getTestUser(
    testUsers.User3.userId
  );
});

test.describe('Upload BSL Letter Template Page', () => {
  test.describe('single campaign client', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userSingleCampaign, page);
    });

    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtUploadBSLLetterTemplatePage(page),
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

    test('no validation errors when form is submitted', async ({ page }) => {
      const uploadPage = new TemplateMgmtUploadBSLLetterTemplatePage(page);

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
      const uploadPage = new TemplateMgmtUploadBSLLetterTemplatePage(page);

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
      const uploadPage = new TemplateMgmtUploadBSLLetterTemplatePage(page);

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
      const uploadPage = new TemplateMgmtUploadBSLLetterTemplatePage(page);

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
      const uploadPage = new TemplateMgmtUploadBSLLetterTemplatePage(page);

      await uploadPage.loadPage();

      await expect(page).toHaveURL(
        '/templates/upload-letter-template/client-id-and-campaign-id-required'
      );
    });
  });

  test.describe('client has letter authoring flag disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userAuthoringDisabled, page);
    });

    test('redirects to choose template type page', async ({ page }) => {
      const uploadPage = new TemplateMgmtUploadBSLLetterTemplatePage(page);

      await uploadPage.loadPage();

      await expect(page).toHaveURL('/templates/choose-a-template-type');
    });
  });
});
