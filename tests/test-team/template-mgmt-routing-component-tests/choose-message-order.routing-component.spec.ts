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
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';

let letterAuthoringEnabledUser: TestUser;

test.describe('Choose Message Order Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    letterAuthoringEnabledUser = await authHelper.getTestUser(
      testUsers.UserLetterAuthoringEnabled.userId
    );
  });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(letterAuthoringEnabledUser, page);
  });

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

  test('should display correct radio button options', async ({ page }) => {
    const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

    await chooseMessageOrderPage.loadPage();

    await expect(chooseMessageOrderPage.radioButtons).toHaveCount(9);

    for (const {
      messageOrder,
      label,
    } of ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS) {
      const radioButton = chooseMessageOrderPage.getRadioButton(messageOrder);
      await expect(radioButton).toBeVisible();
      await expect(radioButton).toHaveAccessibleName(label);
    }
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
    test(`when the ${label} message order is selected, navigates to the create-message-plan page with the correct query parameter`, async ({
      page,
      baseURL,
    }) => {
      const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

      await chooseMessageOrderPage.loadPage();
      await chooseMessageOrderPage.checkRadioButton(messageOrder);
      await chooseMessageOrderPage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/create-message-plan?messageOrder=${encodeURIComponent(messageOrder)}`
      );
    });
});
