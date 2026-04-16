import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { testUsers, type TestUser } from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkTopNotPresent,
  assertAndClickBackLinkBottom,
} from 'helpers/template-mgmt-common.steps';
import { RoutingRenameMessagePlanPage } from 'pages/routing/rename-message-plan-page';
import { getTestContext } from 'helpers/context/context';

const storageHelper = new RoutingConfigStorageHelper();

let user: TestUser;

test.beforeAll(async () => {
  const context = getTestContext();
  user = await context.auth.getTestUser(testUsers.User1.userId);
});

test.afterAll(async () => {
  await storageHelper.deleteSeeded();
});

test('common page tests', async ({ page, baseURL }) => {
  const plan = RoutingConfigFactory.create(user);

  await storageHelper.seed([plan.dbEntry]);

  const renamePage = new RoutingRenameMessagePlanPage(page)
    .setPathParam('messagePlanId', plan.dbEntry.id)
    .setSearchParam('lockNumber', String(plan.dbEntry.lockNumber));

  await renamePage.loadPage();

  await expect(page).toHaveURL(
    `${baseURL}/templates/message-plans/rename-message-plan/${plan.dbEntry.id}?lockNumber=${plan.dbEntry.lockNumber}`
  );

  await expect(renamePage.pageHeading).toHaveText('Rename message plan');

  const props = {
    page: renamePage,
    baseURL,
    expectedUrl: `templates/message-plans/edit-message-plan/${plan.dbEntry.id}`,
  };

  await assertSkipToMainContent(props);
  await assertHeaderLogoLink(props);
  await assertFooterLinks(props);
  await assertSignOutLink(props);
  await assertBackLinkTopNotPresent(props);
  await assertAndClickBackLinkBottom(props);
});

test("message plan doesn't exist", async ({ page, baseURL }) => {
  const renamePage = new RoutingRenameMessagePlanPage(page)
    .setPathParam('messagePlanId', randomUUID())
    .setSearchParam('lockNumber', '0');

  await renamePage.loadPage();

  await expect(page).toHaveURL(`${baseURL}/templates/message-plans/invalid`);
});

test('redirects to the edit message plan page when no lockNumber in url', async ({
  page,
  baseURL,
}) => {
  const plan = RoutingConfigFactory.create(user);

  await storageHelper.seed([plan.dbEntry]);

  const renamePage = new RoutingRenameMessagePlanPage(page).setPathParam(
    'messagePlanId',
    plan.dbEntry.id
  );

  await renamePage.loadPage();

  await expect(page).toHaveURL(
    `${baseURL}/templates/message-plans/edit-message-plan/${plan.dbEntry.id}`
  );
});

test('updates a message plan name and redirects to the template selection page for the message plan', async ({
  baseURL,
  page,
}) => {
  const plan = RoutingConfigFactory.create(user);

  await storageHelper.seed([plan.dbEntry]);

  const renamePage = new RoutingRenameMessagePlanPage(page)
    .setPathParam('messagePlanId', plan.dbEntry.id)
    .setSearchParam('lockNumber', String(plan.dbEntry.lockNumber));

  await renamePage.loadPage();

  await expect(renamePage.nameField).toHaveValue(plan.dbEntry.name);

  await renamePage.nameField.fill('New name!');
  await renamePage.clickSubmit();

  await expect(page).toHaveURL(
    `${baseURL}/templates/message-plans/edit-message-plan/${plan.dbEntry.id}`
  );

  // reload the rename page - should display the latest data
  await renamePage.loadPage();

  await expect(renamePage.nameField).toHaveValue('New name!');
});

test('displays error if name is empty', async ({ page }) => {
  const plan = RoutingConfigFactory.create(user);

  await storageHelper.seed([plan.dbEntry]);

  const renamePage = new RoutingRenameMessagePlanPage(page)
    .setPathParam('messagePlanId', plan.dbEntry.id)
    .setSearchParam('lockNumber', String(plan.dbEntry.lockNumber));

  await renamePage.loadPage();

  await renamePage.nameField.clear();

  await renamePage.clickSubmit();

  await expect(renamePage.nameFieldError).toHaveText(
    'Error: Enter a message plan name'
  );
});

test('displays error if name is too long', async ({ page }) => {
  const plan = RoutingConfigFactory.create(user);

  await storageHelper.seed([plan.dbEntry]);

  const renamePage = new RoutingRenameMessagePlanPage(page)
    .setPathParam('messagePlanId', plan.dbEntry.id)
    .setSearchParam('lockNumber', String(plan.dbEntry.lockNumber));

  await renamePage.loadPage();

  await renamePage.nameField.fill('x'.repeat(201));

  await renamePage.clickSubmit();

  await expect(renamePage.nameFieldError).toHaveText(
    'Error: Message plan name too long'
  );
});
