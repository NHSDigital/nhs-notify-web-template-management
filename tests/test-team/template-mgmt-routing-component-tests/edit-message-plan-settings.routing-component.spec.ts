import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  testUsers,
  type TestUser,
} from 'helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertGoBackLink,
} from 'helpers/template-mgmt-common.steps';
import { RoutingEditMessagePlanSettingsPage } from 'pages/routing/edit-message-plan-settings-page';

const storageHelper = new RoutingConfigStorageHelper();

let user: TestUser;
let userWithoutCampaignId: TestUser;
let userWithMultipleCampaigns: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  user = await authHelper.getTestUser(testUsers.User1.userId);
  userWithoutCampaignId = await authHelper.getTestUser(testUsers.User6.userId);
  userWithMultipleCampaigns = await authHelper.getTestUser(
    testUsers.UserWithMultipleCampaigns.userId
  );
});

test.afterAll(async () => {
  await storageHelper.deleteSeeded();
});

test('common page tests', async ({ page, baseURL }) => {
  const plan = RoutingConfigFactory.create(user);

  await storageHelper.seed([plan.dbEntry]);

  const editPage = new RoutingEditMessagePlanSettingsPage(page);

  await editPage.loadPage(plan.dbEntry.id);

  await expect(page).toHaveURL(
    `${baseURL}/templates/message-plans/edit-message-plan-settings/${plan.dbEntry.id}`
  );

  await expect(editPage.pageHeading).toHaveText('Edit message plan settings');

  const props = {
    page: editPage,
    id: plan.dbEntry.id,
    baseURL,
    expectedUrl: `templates/message-plans/choose-templates/${plan.dbEntry.id}`,
  };

  await assertSkipToMainContent(props);
  await assertHeaderLogoLink(props);
  await assertFooterLinks(props);
  await assertSignOutLink(props);
  await assertGoBackLink(props);
});

test("message plan doesn't exist", async ({ page, baseURL }) => {
  const editPage = new RoutingEditMessagePlanSettingsPage(page);

  await editPage.loadPage(randomUUID());

  await expect(page).toHaveURL(`${baseURL}/templates/message-plans/invalid`);
});

test.describe('single campaign client', () => {
  test('updates a message plan name and redirects to the template selection page for the message plan', async ({
    baseURL,
    page,
  }) => {
    const plan = RoutingConfigFactory.create(user);

    await storageHelper.seed([plan.dbEntry]);

    const editPage = new RoutingEditMessagePlanSettingsPage(page);

    await editPage.loadPage(plan.dbEntry.id);

    await expect(editPage.nameField).toHaveValue(plan.dbEntry.name);

    await expect(editPage.singleCampaignIdElement).toHaveText(
      plan.dbEntry.campaignId
    );

    await expect(editPage.campaignIdSelector).toHaveCount(0);

    await editPage.nameField.fill('New name!');
    await editPage.clickSubmit();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${plan.dbEntry.id}`
    );

    // reload the edit page - should display the latest data
    await editPage.loadPage(plan.dbEntry.id);

    await expect(editPage.nameField).toHaveValue('New name!');

    await expect(editPage.singleCampaignIdElement).toHaveText(
      plan.dbEntry.campaignId
    );
  });

  test('displays error if name is empty', async ({ page }) => {
    const plan = RoutingConfigFactory.create(user);

    await storageHelper.seed([plan.dbEntry]);

    const editPage = new RoutingEditMessagePlanSettingsPage(page);

    await editPage.loadPage(plan.dbEntry.id);

    await editPage.nameField.clear();

    await editPage.clickSubmit();

    await expect(editPage.nameFieldError).toHaveText(
      'Error: Enter a message plan name'
    );
  });

  test('displays error if name is too long', async ({ page }) => {
    const plan = RoutingConfigFactory.create(user);

    await storageHelper.seed([plan.dbEntry]);

    const editPage = new RoutingEditMessagePlanSettingsPage(page);

    await editPage.loadPage(plan.dbEntry.id);

    await editPage.nameField.fill('x'.repeat(201));

    await editPage.clickSubmit();

    await expect(editPage.nameFieldError).toHaveText(
      'Error: Message plan name too long'
    );
  });
});

test.describe('client has multiple campaigns', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(userWithMultipleCampaigns, page);
  });

  test('updates the message plan name and campaign id, redirects to the template selection page for the template', async ({
    baseURL,
    page,
  }) => {
    const plan = RoutingConfigFactory.create(userWithMultipleCampaigns);

    await storageHelper.seed([plan.dbEntry]);

    const editPage = new RoutingEditMessagePlanSettingsPage(page);

    await editPage.loadPage(plan.dbEntry.id);

    await expect(editPage.nameField).toHaveValue(plan.dbEntry.name);

    await expect(editPage.campaignIdSelector).toHaveValue(
      plan.dbEntry.campaignId
    );

    await expect(editPage.singleCampaignIdElement).toHaveCount(0);

    await editPage.nameField.fill('Updated name');
    await editPage.campaignIdSelector.selectOption(
      userWithMultipleCampaigns.campaignIds?.[1] as string
    );

    await editPage.clickSubmit();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${plan.dbEntry.id}`
    );

    // reload the edit page - should display the latest data
    await editPage.loadPage(plan.dbEntry.id);

    await expect(editPage.nameField).toHaveValue('Updated name');

    await expect(editPage.campaignIdSelector).toHaveValue(
      userWithMultipleCampaigns.campaignIds?.[1] as string
    );
  });

  test('displays error if campaign id is not selected', async ({ page }) => {
    const plan = RoutingConfigFactory.create(userWithMultipleCampaigns);

    await storageHelper.seed([plan.dbEntry]);

    const editPage = new RoutingEditMessagePlanSettingsPage(page);

    await editPage.loadPage(plan.dbEntry.id);

    await editPage.campaignIdSelector.selectOption('');

    await editPage.clickSubmit();

    await expect(editPage.campaignIdFieldError).toHaveText(
      'Error: Select a campaign'
    );
  });
});

test.describe('client has no campaign id', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(userWithoutCampaignId, page);
  });

  test('redirects to invalid config page', async ({ baseURL, page }) => {
    const plan = RoutingConfigFactory.create(userWithoutCampaignId);

    await storageHelper.seed([plan.dbEntry]);

    const editPage = new RoutingEditMessagePlanSettingsPage(page);

    await editPage.loadPage(plan.dbEntry.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/campaign-id-required`
    );
  });
});
