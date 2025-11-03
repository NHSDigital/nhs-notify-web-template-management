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
import { RoutingMoveToProductionPage } from 'pages/routing/move-to-production-page';

const storageHelper = new RoutingConfigStorageHelper();

let user: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  user = await authHelper.getTestUser(testUsers.User1.userId);
});

test.afterAll(async () => {
  await storageHelper.deleteSeeded();
});

test.describe('Create Message Plan Page', () => {
  test('common page tests', async ({ page, baseURL }) => {
    const routingConfig =
      RoutingConfigFactory.create(user).withTemplates('NHSAPP');

    await storageHelper.seed([routingConfig.dbEntry]);

    const props = {
      page: new RoutingMoveToProductionPage(page),
      id: routingConfig.dbEntry.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
  });

  test('moves the message plan to production and redirects to list page', async ({
    baseURL,
    page,
  }) => {
    const routingConfig =
      RoutingConfigFactory.create(user).withTemplates('NHSAPP');

    await storageHelper.seed([routingConfig.dbEntry]);

    const moveToProductionPage = new RoutingMoveToProductionPage(page);

    await moveToProductionPage.loadPage(routingConfig.dbEntry.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/move-to-production/${routingConfig.dbEntry.id}`
    );

    await moveToProductionPage.submitButton.click();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans`);

    const messagePlansPage = new RoutingMessagePlansPage(page);

    await messagePlansPage.productionMessagePlansTable.click();

    const productionIdCells =
      messagePlansPage.productionMessagePlansTable.getByTestId(
        'message-plan-id-cell'
      );

    const productionCellsText = await productionIdCells.allTextContents();

    expect(productionCellsText).toContainEqual(
      expect.stringContaining(routingConfig.dbEntry.id)
    );
  });

  test('links to preview page for the message plan', async ({
    baseURL,
    page,
  }) => {
    const routingConfig =
      RoutingConfigFactory.create(user).withTemplates('NHSAPP');

    await storageHelper.seed([routingConfig.dbEntry]);

    const moveToProductionPage = new RoutingMoveToProductionPage(page);

    await moveToProductionPage.loadPage(routingConfig.dbEntry.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/move-to-production/${routingConfig.dbEntry.id}`
    );

    await moveToProductionPage.previewLink.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/preview-message-plan/${routingConfig.dbEntry.id}`
    );
  });

  test('cancel button links to the message plan list page, does not move the plan to production', async ({
    baseURL,
    page,
  }) => {
    const routingConfig =
      RoutingConfigFactory.create(user).withTemplates('NHSAPP');

    await storageHelper.seed([routingConfig.dbEntry]);

    const moveToProductionPage = new RoutingMoveToProductionPage(page);

    await moveToProductionPage.loadPage(routingConfig.dbEntry.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/move-to-production/${routingConfig.dbEntry.id}`
    );

    await moveToProductionPage.cancelLink.click();

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
