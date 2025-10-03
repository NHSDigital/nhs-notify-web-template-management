import { test, expect } from '@playwright/test';
import { RoutingChooseMessageOrderPage } from '../pages/routing-choose-message-order-page';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../helpers/template-mgmt-common.steps';

test.describe('Choose Message Order Page', () => {
  test('should land on "Choose Message Order" page when navigating to "/choose-message-order" url', async ({
    page,
    baseURL,
  }) => {
    const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

    await chooseMessageOrderPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/choose-message-order`);
    await expect(chooseMessageOrderPage.pageHeading).toHaveText(
      'Choose a message order'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingChooseMessageOrderPage(page),
      id: '',
      baseURL,
      expectedUrl: 'message-plans',
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLink(props);
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

    await expect(page).toHaveURL(`${baseURL}/templates/choose-message-order`);

    await expect(chooseMessageOrderPage.errorSummary).toBeVisible();
    await expect(chooseMessageOrderPage.errorSummaryList).toHaveText([
      'Select a message order',
    ]);
  });

  for (const { label, path } of [
    {
      path: encodeURIComponent('/create-message-plan?messageOrder=NHS_APP'),
      label: 'NHS App only',
    },
    {
      path: encodeURIComponent(
        '/create-message-plan?messageOrder=NHS_APP,EMAIL'
      ),
      label: 'NHS App, Email',
    },
    {
      path: encodeURIComponent('/create-message-plan?messageOrder=NHS_APP,SMS'),
      label: 'NHS App, Text message',
    },
    {
      path: encodeURIComponent(
        '/create-message-plan?messageOrder=NHS_APP,EMAIL,SMS'
      ),
      label: 'NHS App, Email, Text message',
    },
    {
      path: encodeURIComponent(
        '/create-message-plan?messageOrder=NHS_APP,SMS,EMAIL'
      ),
      label: 'NHS App, Text message, Email',
    },
    {
      path: encodeURIComponent(
        '/create-message-plan?messageOrder=NHS_APP,SMS,LETTER'
      ),
      label: 'NHS App, Text message, Letter',
    },
    {
      path: encodeURIComponent(
        '/create-message-plan?messageOrder=NHS_APP,EMAIL,SMS,LETTER'
      ),
      label: 'NHS App, Email, Text message, Letter',
    },
    {
      path: encodeURIComponent('/create-message-plan?messageOrder=LETTER'),
      label: 'Letter only',
    },
  ])
    test(`should navigate to the ${label} message order creation page when radio button selected and continue button clicked`, async ({
      page,
      baseURL,
    }) => {
      const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

      await chooseMessageOrderPage.loadPage();
      await chooseMessageOrderPage.checkRadioButton(label);
      await chooseMessageOrderPage.clickContinueButton();

      await expect(page).toHaveURL(`${baseURL}/templates/${path}`);
    });
});
