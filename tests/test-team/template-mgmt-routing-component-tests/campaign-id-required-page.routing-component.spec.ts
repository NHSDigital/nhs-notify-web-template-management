import { test, expect } from '@playwright/test';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { MessagePlanCampaignIdRequiredPage } from 'pages/routing/campaign-id-required-page';

test.describe('Message Plan Campaign Id Required Page', () => {
  test('common page tests', async ({ page, baseURL }) => {
    const campaignIdRequiredPage = new MessagePlanCampaignIdRequiredPage(page);

    await campaignIdRequiredPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/campaign-id-required`
    );

    await expect(campaignIdRequiredPage.heading).toHaveText(
      'You cannot create message plans yet'
    );
    await expect(campaignIdRequiredPage.errorDetailsInsetText).toHaveText(
      'Account needs a campaign ID'
    );

    await expect(campaignIdRequiredPage.goBackLink).toHaveText('Go back');
    await expect(campaignIdRequiredPage.goBackLink).toHaveAttribute(
      'href',
      '/templates/message-plans'
    );

    await assertFooterLinks({ page: campaignIdRequiredPage });
    await assertSignOutLink({ page: campaignIdRequiredPage });
    await assertHeaderLogoLink({ page: campaignIdRequiredPage });
    await assertSkipToMainContent({ page: campaignIdRequiredPage });
  });
});
