import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  testUsers,
  type TestUser,
} from 'helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS } from 'helpers/enum';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertGoBackLink,
} from 'helpers/template-mgmt-common.steps';
import { RoutingCreateMessagePlanPage } from 'pages/routing/create-message-plan-page';

const chooseTemplatesRegexp =
  /\/message-plans\/choose-templates\/([\dA-Fa-f-]+)$/;

const routingConfigStorageHelper = new RoutingConfigStorageHelper();

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
  await routingConfigStorageHelper.deleteAdHoc();
});

test.describe('Create Message Plan Page', () => {
  test.describe('with a valid message order', () => {
    const messageOrder = 'NHSAPP';

    test.describe('single campaign client', () => {
      test('creates a message plan and redirects to the template selection page for the created message plan', async ({
        page,
      }) => {
        const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
          messageOrder,
        });

        await createMessagePlanPage.loadPage();

        await createMessagePlanPage.nameField.fill('My Message Plan');

        await expect(createMessagePlanPage.singleCampaignIdElement).toHaveText(
          user.campaignIds?.at(0) as string
        );

        await expect(createMessagePlanPage.campaignIdSelector).toHaveCount(0);

        await createMessagePlanPage.clickSubmit();

        await expect(page).toHaveURL(chooseTemplatesRegexp);

        const urlParts = page.url().match(chooseTemplatesRegexp);

        routingConfigStorageHelper.addAdHocKey({
          id: urlParts![1],
          clientId: user.clientId,
        });
      });

      test('displays error if name is empty', async ({ page }) => {
        const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
          messageOrder,
        });

        await createMessagePlanPage.loadPage();

        await createMessagePlanPage.clickSubmit();

        await expect(createMessagePlanPage.nameFieldError).toHaveText(
          'Error: Enter a message plan name'
        );
      });

      test('displays error if name is too long', async ({ page }) => {
        const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
          messageOrder,
        });

        await createMessagePlanPage.loadPage();

        await createMessagePlanPage.nameField.fill('x'.repeat(201));

        await createMessagePlanPage.clickSubmit();

        await expect(createMessagePlanPage.nameFieldError).toHaveText(
          'Error: Message plan name too long'
        );
      });
    });
  });

  test.describe('client has multiple campaigns', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithMultipleCampaigns, page);
    });

    test('creates a message plan and redirects to the template selection page for the created template', async ({
      page,
    }) => {
      const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
        messageOrder: 'NHSAPP',
      });

      await createMessagePlanPage.loadPage();

      await createMessagePlanPage.nameField.fill('My Message Plan');

      await expect(createMessagePlanPage.singleCampaignIdElement).toHaveCount(
        0
      );

      await createMessagePlanPage.campaignIdSelector.selectOption(
        userWithMultipleCampaigns.campaignIds?.at(0) as string
      );

      await createMessagePlanPage.clickSubmit();

      await expect(page).toHaveURL(chooseTemplatesRegexp);

      const urlParts = page.url().match(chooseTemplatesRegexp);

      routingConfigStorageHelper.addAdHocKey({
        id: urlParts![1],
        clientId: userWithMultipleCampaigns.clientId,
      });
    });

    test('displays error if campaign id is not selected', async ({ page }) => {
      const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
        messageOrder: 'NHSAPP',
      });

      await createMessagePlanPage.loadPage();

      await createMessagePlanPage.nameField.fill('My Message Plan');

      await createMessagePlanPage.clickSubmit();

      await expect(createMessagePlanPage.campaignIdFieldError).toHaveText(
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
      const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
        messageOrder: 'NHSAPP',
      });

      await createMessagePlanPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/campaign-id-required`
      );
    });
  });

  for (const { messageOrder } of ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS)
    test.describe(`with the messageOrder query parameter set to ${messageOrder}`, () => {
      test('common page tests', async ({ page, baseURL }) => {
        const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
          messageOrder,
        });

        await createMessagePlanPage.loadPage();

        await expect(page).toHaveURL(
          `${baseURL}/templates/message-plans/create-message-plan?messageOrder=${encodeURIComponent(messageOrder)}`
        );
        await expect(createMessagePlanPage.pageHeading).toHaveText(
          'Create a message plan'
        );

        const props = {
          page: createMessagePlanPage,
          id: '',
          baseURL,
          expectedUrl: '/templates/message-plans/choose-message-order',
        };

        await assertSkipToMainContent(props);
        await assertHeaderLogoLink(props);
        await assertFooterLinks(props);
        await assertSignOutLink(props);
        await assertGoBackLink(props);
      });
    });

  test.describe('with no messageOrder query parameter set', () => {
    test('redirects to message order page', async ({ page, baseURL }) => {
      const createMessagePlanPage = new RoutingCreateMessagePlanPage(page);

      await createMessagePlanPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-message-order`
      );
    });
  });

  test.describe('with invalid messageOrder query parameter set', () => {
    test('redirects to message order page', async ({ page, baseURL }) => {
      const createMessagePlanPage = new RoutingCreateMessagePlanPage(page, {
        messageOrder: 'INVALID',
      });

      await createMessagePlanPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-message-order`
      );
    });
  });
});
