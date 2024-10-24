import { test, expect } from '@playwright/test';
import { TemplateMgmtBasePage } from '../pages/template-mgmt-base-page';

type CommonStepsProps = {
  page: TemplateMgmtBasePage;
  id: string;
  baseURL?: string;
};

export function assertSkipToMainContent({
  page,
  id: sessionId,
}: CommonStepsProps) {
  return test.step('when user clicks "skip to main content", then page heading is focused', async () => {
    await page.loadPage(sessionId);

    await page.page.keyboard.press('Tab');

    await expect(page.skipLink).toBeFocused();

    await page.page.keyboard.press('Enter');

    await expect(page.pageHeader).toBeFocused();
  });
}

export function assertNotifyBannerLink({
  page,
  id,
  baseURL,
}: CommonStepsProps) {
  return test.step('when user clicks "Notify banner link", then user is redirected to "start page"', async () => {
    await page.loadPage(id);

    await page.clickNotifyBannerLink();

    await expect(page.page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
  });
}

export function assertLoginLink({ page, id, baseURL }: CommonStepsProps) {
  return test.step('when user clicks "Log in", then user is redirected to "login page"', async () => {
    await page.loadPage(id);

    await page.clickLoginLink();

    await expect(page.page).toHaveURL(`${baseURL}/templates`);
  });
}

export function assertGoBackLink({
  page,
  id,
  baseURL,
  expectedUrl,
}: CommonStepsProps & { expectedUrl: string }) {
  return test.step('when user clicks "Go back", then user is redirect to previous page', async () => {
    await page.loadPage(id);

    await page.goBackLink.click();

    await expect(page.page).toHaveURL(`${baseURL}/${expectedUrl}`);
  });
}

export function assertFooterLinks({ page, id }: CommonStepsProps) {
  return test.step('when page loads, then "Footer links" should be visible', async () => {
    await page.loadPage(id);

    const promises = [
      // Accessibility link
      await page.page
        .locator('[data-testid="accessibility-statement-link"]')
        .isVisible(),

      // Contact us link
      await page.page.locator('[data-testid="contact-use-link"]').isVisible(),

      // Cookies link
      await page.page.locator('[data-testid="cookies-link"]').isVisible(),

      // Privacy policy link
      await page.page
        .locator('[data-testid="privacy-policy-link"]')
        .isVisible(),

      // Terms and conditions link
      await page.page
        .locator('[data-testid="terms-and-conditions-link"]')
        .isVisible(),
    ];

    await Promise.all(promises);
  });
}
