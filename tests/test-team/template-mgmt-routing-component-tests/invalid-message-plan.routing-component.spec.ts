import { test, expect } from '@playwright/test';
import { RoutingInvalidMessagePlanPage } from 'pages/routing/invalid-message-plan-page';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertNoBackLinks,
} from '../helpers/template-mgmt-common.steps';

test.describe('Invalid Message Plan Page', () => {
  test('displays invalid message plan page', async ({ page, baseURL }) => {
    const invalidMessagePlanPage = new RoutingInvalidMessagePlanPage(page);

    invalidMessagePlanPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans/invalid`);

    await expect(invalidMessagePlanPage.pageHeading).toHaveText(
      'Sorry, we could not find that page'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingInvalidMessagePlanPage(page),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertNoBackLinks(props);
  });
});
