import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { test } from 'fixtures/accessibility-analyze';
import {
  RoutingChooseMessageOrderPage,
  RoutingCreateMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
} from 'pages/routing';
import { loginAsUser } from 'helpers/auth/login-as-user';

let user: TestUser;
let userWithMultipleCampaigns: TestUser;

const routingStorageHelper = new RoutingConfigStorageHelper();

test.describe('Routing - Accessibility', () => {
  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    user = await authHelper.getTestUser(testUsers.User1.userId);

    userWithMultipleCampaigns = await authHelper.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );

    await routingStorageHelper.seed([
      RoutingConfigFactory.create(user).dbEntry,
    ]);
  });

  test.afterAll(async () => {
    await routingStorageHelper.deleteSeeded();
  });

  test('Message plans', async ({ page, analyze }) =>
    analyze(new RoutingMessagePlansPage(page)));

  test('Campaign required', async ({ page, analyze }) =>
    analyze(new RoutingMessagePlanCampaignIdRequiredPage(page)));

  test('Choose message order', async ({ page, analyze }) =>
    analyze(new RoutingChooseMessageOrderPage(page)));

  test('Choose message order - error', async ({ page, analyze }) =>
    analyze(new RoutingChooseMessageOrderPage(page), {
      beforeAnalyze: (p) => p.clickContinueButton(),
    }));

  test.describe('client has multiple campaigns', () => {
    const messageOrder = 'NHSAPP,EMAIL,SMS,LETTER';

    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithMultipleCampaigns, page);
    });

    test('Create message plan', async ({ page, analyze }) =>
      analyze(
        new RoutingCreateMessagePlanPage(page, {
          messageOrder,
        })
      ));

    test('Create message plan - error', async ({ page, analyze }) =>
      analyze(
        new RoutingCreateMessagePlanPage(page, {
          messageOrder,
        }),
        { beforeAnalyze: (p) => p.clickSubmit() }
      ));
  });
});
