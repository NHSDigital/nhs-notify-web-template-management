import { test, expect } from '@playwright/test';
import { RoutingChooseMessageOrderPage } from '../pages/routing/choose-message-order-page';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottom,
  assertBackLinkTopNotPresent,
} from '../helpers/template-mgmt-common.steps';
import { ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS } from 'helpers/enum';

test.describe('Choose Message Order Page', () => {
  test('should land on "Choose Message Order" page when navigating to "/choose-message-order" url', async ({
    page,
    baseURL,
  }) => {
    const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

    await chooseMessageOrderPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-message-order`
    );
    await expect(chooseMessageOrderPage.pageHeading).toHaveText(
      'Choose a message order'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingChooseMessageOrderPage(page),
      id: '',
      baseURL,
      expectedUrl: 'templates/message-plans',
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom({
      ...props,
      expectedUrl: 'templates/message-plans',
    });
    await assertBackLinkTopNotPresent(props);
  });

  test('should display correct number of radio button options', async ({
    page,
  }) => {
    const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

    await chooseMessageOrderPage.loadPage();

    await expect(chooseMessageOrderPage.radioButtons).toHaveCount(8);
  });

  test('should display error if no message order option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

    await chooseMessageOrderPage.loadPage();
    await chooseMessageOrderPage.clickContinueButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-message-order`
    );

    await expect(chooseMessageOrderPage.errorSummary).toBeVisible();
    await expect(chooseMessageOrderPage.errorSummaryList).toHaveText([
      'Select a message order',
    ]);
  });

  for (const {
    label,
    messageOrder,
  } of ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS)
    test(`when the ${label} message order is selected, nagivates to the create-message-plan page with the correct query parameter`, async ({
      page,
      baseURL,
    }) => {
      const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

      await chooseMessageOrderPage.loadPage();
      await chooseMessageOrderPage.checkRadioButton(label);
      await chooseMessageOrderPage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/create-message-plan?messageOrder=${encodeURIComponent(messageOrder)}`
      );
    });
});
