import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { TemplateFactory } from 'helpers/factories/template-factory';
import {
  assertAndClickBackLinkBottom,
  assertBackLinkTopNotPresent,
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { TemplateMgmtEditTemplateCampaignPage } from 'pages/letter/template-mgmt-edit-template-campaign-page';
import { TemplateMgmtPreviewLetterPage } from 'pages/letter/template-mgmt-preview-letter-page';

test.describe('Edit Template Campaign page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const templateStorageHelper = new TemplateStorageHelper();
  const authHelper = createAuthHelper();

  let userMultiCampaignAuthoringEnabled: TestUser;
  let userMultiCampaignAuthoringDisabled: TestUser;
  let userSingleCampaignAuthoringDisabled: TestUser;
  let userSingleCampaignAuthoringEnabled: TestUser;

  test.beforeAll(async () => {
    const clientMultiCampaignAuthoringEnabled = await authHelper.createClient({
      campaignIds: ['Campaign 1', 'Campaign 2'],
      features: {
        proofing: false,
        letterAuthoring: true,
      },
    });

    const clientMultiCampaignAuthoringDisabled = await authHelper.createClient({
      campaignIds: ['Campaign 1', 'Campaign 2'],
      features: {
        proofing: false,
        letterAuthoring: false,
      },
    });

    userMultiCampaignAuthoringEnabled = await authHelper.createAdHocUser(
      clientMultiCampaignAuthoringEnabled
    );
    userMultiCampaignAuthoringDisabled = await authHelper.createAdHocUser(
      clientMultiCampaignAuthoringDisabled
    );

    userSingleCampaignAuthoringDisabled = await authHelper.getTestUser(
      testUsers.User1.userId
    );
    userSingleCampaignAuthoringEnabled = await authHelper.getTestUser(
      testUsers.UserLetterAuthoringEnabled.userId
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test.describe('with letter authoring enabled and multiple campaigns available', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(userMultiCampaignAuthoringEnabled, page);
    });

    test('common page tests', async ({ page, baseURL }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const props = {
        page: new TemplateMgmtEditTemplateCampaignPage(page)
          .setPathParam('templateId', template.id)
          .setSearchParam('lockNumber', String(template.lockNumber)),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkTopNotPresent(props);
      await assertAndClickBackLinkBottom({
        ...props,
        expectedUrl: `templates/preview-letter-template/${template.id}`,
      });
    });

    test('updates the template campaign and redirects back to the preview page', async ({
      page,
    }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED',
        { campaignId: 'Campaign 1' }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(editPage.campaignSelect).toHaveValue('Campaign 1');

      await editPage.campaignSelect.selectOption('Campaign 2');
      await editPage.submitButton.click();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );

      const previewPage = new TemplateMgmtPreviewLetterPage(page);

      await expect(previewPage.campaignId).toContainText('Campaign 2');
    });

    test('shows error when submitting an empty form', async ({ page }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(editPage.errorSummary).toBeHidden();

      await editPage.campaignSelect.selectOption('');

      await editPage.submitButton.click();

      await expect(page).toHaveURL(
        `/templates/edit-template-campaign/${template.id}?lockNumber=${template.lockNumber}`
      );

      await expect(editPage.errorSummaryList).toHaveText(['Choose a campaign']);
    });

    test("redirects to invalid template page if template doesn't exist", async ({
      page,
    }) => {
      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', 'no-exist')
        .setSearchParam('lockNumber', '1');

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/invalid-template');
    });

    test('redirects to template list page if template type is NHS_APP', async ({
      page,
    }) => {
      const template = TemplateFactory.createNhsAppTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template list page if template type is EMAIL', async ({
      page,
    }) => {
      const template = TemplateFactory.createEmailTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template list page if template type is SMS', async ({
      page,
    }) => {
      const template = TemplateFactory.createSmsTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template preview page if template is a PDF letter', async ({
      page,
    }) => {
      const template = TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled,
        'PDF Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });

    test('redirects to preview submitted template page if template is submitted', async ({
      page,
    }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled,
        'Letter Template',
        'SUBMITTED'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-submitted-letter-template/${template.id}`
      );
    });

    test('redirects to preview page when lockNumber query parameter is missing', async ({
      page,
    }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userMultiCampaignAuthoringEnabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(
        page
      ).setPathParam('templateId', template.id);

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });
  });

  test.describe('multi-campaign client with letter authoring disabled', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(userMultiCampaignAuthoringDisabled, page);
    });

    test('redirects to template list page', async ({ page }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userMultiCampaignAuthoringDisabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });
  });

  test.describe('single-campaign client with letter authoring enabled', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(userSingleCampaignAuthoringEnabled, page);
    });

    test('redirects to template preview page', async ({ page }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userSingleCampaignAuthoringEnabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });
  });

  test.describe('single-campaign client with letter authoring disabled', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(userSingleCampaignAuthoringDisabled, page);
    });

    test('redirects to template list page', async ({ page }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userSingleCampaignAuthoringDisabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateCampaignPage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });
  });
});
