import { test, expect } from '@playwright/test';
import { RoutingMessagePlansPage } from '../pages/routing/message-plans-page';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertNoBackLinks,
} from '../helpers/template-mgmt-common.steps';
import { createAuthHelper, testUsers } from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigDbEntry } from 'helpers/types';

type MessagePlansPageData = {
  draftNew: RoutingConfigDbEntry;
  draftOld: RoutingConfigDbEntry;
  production: RoutingConfigDbEntry;
  deleted: RoutingConfigDbEntry;
};

async function createRoutingConfigs(): Promise<MessagePlansPageData> {
  const authHelper = createAuthHelper();
  const user = await authHelper.getTestUser(testUsers.User1.userId);

  return {
    draftNew: RoutingConfigFactory.create(user).dbEntry,
    draftOld: {
      ...RoutingConfigFactory.create(user).dbEntry,
      updatedAt: new Date('2020-10-09T00:00:00.000Z').toISOString(),
    },
    production: RoutingConfigFactory.create(user, { status: 'COMPLETED' })
      .dbEntry,
    deleted: RoutingConfigFactory.create(user, { status: 'DELETED' }).dbEntry,
  };
}

test.describe('Message plans Page', () => {
  const routingStorageHelper = new RoutingConfigStorageHelper();
  let routingConfigs: MessagePlansPageData;

  test.beforeAll(async () => {
    routingConfigs = await createRoutingConfigs();
    await routingStorageHelper.seed(Object.values(routingConfigs));
  });

  test('should land on "Message plans" page when navigating to "/templates/message-plans" url', async ({
    page,
    baseURL,
  }) => {
    const messagePlanPage = new RoutingMessagePlansPage(page);

    await messagePlanPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans`);
    await expect(messagePlanPage.pageHeading).toHaveText('Message plans');
  });

  test('Routing configs appear sorted in the appropriate section', async ({
    page,
  }) => {
    const messagePlanPage = new RoutingMessagePlansPage(page);
    await messagePlanPage.loadPage();

    await expect(messagePlanPage.draftMessagePlansTable).not.toHaveAttribute(
      'open'
    );

    await messagePlanPage.draftMessagePlansTable.click();

    await expect(messagePlanPage.draftMessagePlansTable).toHaveAttribute(
      'open'
    );

    const draftIdCells = messagePlanPage.draftMessagePlansTable.getByTestId(
      'message-plan-id-cell'
    );

    const draftRoutingPlanCellsText = await draftIdCells.allTextContents();

    const knownDraftIds = draftRoutingPlanCellsText.filter(
      (text) =>
        text.includes(routingConfigs.draftNew.id) ||
        text.includes(routingConfigs.draftOld.id)
    );

    expect(knownDraftIds).toEqual([
      expect.stringMatching(routingConfigs.draftNew.id),
      expect.stringMatching(routingConfigs.draftOld.id),
    ]);

    expect(
      draftRoutingPlanCellsText.find((cell) =>
        cell.includes(routingConfigs.deleted.id)
      )
    ).toBeUndefined();

    await expect(
      messagePlanPage.productionMessagePlansTable
    ).not.toHaveAttribute('open');

    await messagePlanPage.productionMessagePlansTable.click();

    await expect(messagePlanPage.productionMessagePlansTable).toHaveAttribute(
      'open'
    );

    const productionIdCells =
      messagePlanPage.productionMessagePlansTable.getByTestId(
        'message-plan-id-cell'
      );

    const productionRoutingPlanCellsText =
      await productionIdCells.allTextContents();

    expect(
      productionRoutingPlanCellsText.some((cell) =>
        cell.includes(routingConfigs.production.id)
      )
    ).toBeTruthy();

    expect(
      productionRoutingPlanCellsText.find((cell) =>
        cell.includes(routingConfigs.deleted.id)
      )
    ).toBeUndefined();
  });

  test('should copy message plan names and IDs to clipboard when copy button is clicked', async ({
    page,
  }) => {
    const messagePlanPage = new RoutingMessagePlansPage(page);
    await messagePlanPage.loadPage();

    await messagePlanPage.draftMessagePlansTable.click();

    const draftCopyButton = page.getByTestId('copy-button-draft');

    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);

    await draftCopyButton.click();

    await expect(draftCopyButton).toHaveText(
      'Names and IDs copied to clipboard'
    );

    const draftClipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );

    expect(draftClipboardText).toContain('routing_plan_name,routing_plan_id');

    expect(draftClipboardText).toContain(
      `"${routingConfigs.draftNew.name}","${routingConfigs.draftNew.id}"`
    );
    expect(draftClipboardText).toContain(
      `"${routingConfigs.draftOld.name}","${routingConfigs.draftOld.id}"`
    );

    await messagePlanPage.productionMessagePlansTable.click();

    const productionCopyButton = page.getByTestId('copy-button-production');

    await productionCopyButton.click();

    await expect(productionCopyButton).toHaveText(
      'Names and IDs copied to clipboard'
    );

    const productionClipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );

    expect(productionClipboardText).toContain(
      'routing_plan_name,routing_plan_id'
    );

    expect(productionClipboardText).toContain(
      `"${routingConfigs.production.name}","${routingConfigs.production.id}"`
    );
  });

  test('should display error message when clipboard write fails', async ({
    page,
  }) => {
    const messagePlanPage = new RoutingMessagePlansPage(page);
    await messagePlanPage.loadPage();

   await page
      .context()
      .clearPermissions();

    await messagePlanPage.draftMessagePlansTable.click();

    const copyButton = page.getByTestId('copy-button-draft');

    await copyButton.click();

    await expect(copyButton).toHaveText(
      'Failed copying names and IDs to clipboard'
    );

    await messagePlanPage.productionMessagePlansTable.click();

    const productionButton = page.getByTestId('copy-button-production');

    await productionButton.click();

    await expect(productionButton).toHaveText(
      'Failed copying names and IDs to clipboard'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingMessagePlansPage(page),
      id: '',
      baseURL,
      expectedUrl: 'templates/message-plans',
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertNoBackLinks(props);
  });
});
