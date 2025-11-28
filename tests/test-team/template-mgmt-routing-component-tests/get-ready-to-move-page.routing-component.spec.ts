import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { RoutingMessagePlansPage } from 'pages/routing/message-plans-page';
import { RoutingGetReadyToMovePage } from 'pages/routing/get-ready-to-move-page';

const routingConfigStorage = new RoutingConfigStorageHelper();

let user: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  user = await authHelper.getTestUser(testUsers.User1.userId);
});

test.afterAll(async () => {
  await routingConfigStorage.deleteSeeded();
});

test.describe('Create Message Plan Page', () => {
  test('common page tests', async ({ page, baseURL }) => {
    const routingConfig = RoutingConfigFactory.create(user);

    await routingConfigStorage.seed([routingConfig.dbEntry]);

    const props = {
      page: new RoutingGetReadyToMovePage(page),
      id: routingConfig.dbEntry.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
  });

  test('continue button navigates to the review and move to production page', async ({
    baseURL,
    page,
  }) => {
    const routingConfig = RoutingConfigFactory.create(user);

    await routingConfigStorage.seed([routingConfig.dbEntry]);

    const getReadyToMovePage = new RoutingGetReadyToMovePage(page);

    await getReadyToMovePage.loadPage(routingConfig.dbEntry.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/get-ready-to-move/${routingConfig.dbEntry.id}`
    );

    await getReadyToMovePage.continueLink.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/review-and-move-to-production/${routingConfig.dbEntry.id}`
    );
  });

  test('cancel button links to the message plan list page, does not move the plan to production', async ({
    baseURL,
    page,
  }) => {
    const routingConfig = RoutingConfigFactory.create(user);

    await routingConfigStorage.seed([routingConfig.dbEntry]);

    const getReadyToMovePage = new RoutingGetReadyToMovePage(page);

    await getReadyToMovePage.loadPage(routingConfig.dbEntry.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/get-ready-to-move/${routingConfig.dbEntry.id}`
    );

    await getReadyToMovePage.cancelLink.click();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans`);

    const messagePlansPage = new RoutingMessagePlansPage(page);

    await messagePlansPage.draftMessagePlansTable.click();

    const draftIdCells = messagePlansPage.draftMessagePlansTable.getByTestId(
      'message-plan-id-cell'
    );

    const draftCellsText = await draftIdCells.allTextContents();

    expect(draftCellsText).toContainEqual(
      expect.stringContaining(routingConfig.dbEntry.id)
    );
  });
});
