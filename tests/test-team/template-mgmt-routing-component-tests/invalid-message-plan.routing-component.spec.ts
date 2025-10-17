import { test, expect } from '@playwright/test';
import { RoutingInvalidMessagePlanPage } from 'pages/routing/invalid-message-plan-page';

test.describe('Invalid Message Plan Page', () => {
  test('redirects to invalid message plan page for invalid ID', async ({
    page,
  }) => {
    await page.goto('/message-plans/choose-templates/invalid-id');
    const invalidMessagePlanPage = new RoutingInvalidMessagePlanPage(page);
  });
});
