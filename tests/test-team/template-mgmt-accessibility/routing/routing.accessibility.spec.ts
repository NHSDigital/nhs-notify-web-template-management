import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { test, expect } from 'fixtures/axe-test';
import {
  RoutingChooseMessageOrderPage,
  RoutingCreateMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
} from 'pages/routing';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';
import AxeBuilder from '@axe-core/playwright';

let user: TestUser;
let userWithMultipleCampaigns: TestUser;

const routingStorageHelper = new RoutingConfigStorageHelper();

async function run<T extends TemplateMgmtBasePage>(
  page: T,
  makeAxeBuilder: () => AxeBuilder,
  fn?: (page: T) => Promise<void>
) {
  await page.loadPage();
  if (fn) {
    await fn(page);
  }
  const results = await makeAxeBuilder().analyze();
  expect(results.violations).toEqual([]);
}

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

  test('Message plans', async ({ page, makeAxeBuilder }) =>
    run(new RoutingMessagePlansPage(page), makeAxeBuilder));

  test('Campaign required', async ({ page, makeAxeBuilder }) =>
    run(new RoutingMessagePlanCampaignIdRequiredPage(page), makeAxeBuilder));

  test('Choose message order', async ({ page, makeAxeBuilder }) =>
    run(new RoutingChooseMessageOrderPage(page), makeAxeBuilder));

  test('Choose message order - error', async ({ page, makeAxeBuilder }) =>
    run(new RoutingChooseMessageOrderPage(page), makeAxeBuilder, (p) =>
      p.clickContinueButton()
    ));

  test.describe('client has multiple campaigns', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithMultipleCampaigns, page);
    });

    test('Create message plan', async ({ page, makeAxeBuilder }) =>
      run(
        new RoutingCreateMessagePlanPage(page, {
          messageOrder: 'NHSAPP,EMAIL,SMS,LETTER',
        }),
        makeAxeBuilder
      ));

    test('Create message plan - error', async ({ page, makeAxeBuilder }) =>
      run(
        new RoutingCreateMessagePlanPage(page, {
          messageOrder: 'NHSAPP,EMAIL,SMS,LETTER',
        }),
        makeAxeBuilder,
        (p) => p.clickSubmit()
      ));
  });
});
