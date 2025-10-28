import { test, expect } from '@playwright/test';
import { RoutingInvalidMessagePlanPage } from 'pages/routing/invalid-message-plan-page';

test.describe('Invalid Message Plan Page', () => {
  test('displays invalid message plan page', async ({ page, baseURL }) => {
    const invalidMessagePlanPage = new RoutingInvalidMessagePlanPage(page);

    invalidMessagePlanPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans/invalid`);

    await expect(invalidMessagePlanPage.pageHeading).toHaveText(
      'Sorry, we could not find that page'
    );
  });
});
