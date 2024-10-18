import { test, expect } from '@playwright/test';
import { TemplateMgmtBasePage } from '../pages/template-mgmt-base-page';

type CommonStepsProps = {
  page: TemplateMgmtBasePage;
  sessionId: string;
  baseURL?: string;
};

export function assertSkipToMainContent({ page, sessionId }: CommonStepsProps) {
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
  sessionId,
  baseURL,
}: CommonStepsProps) {
  return test.step('when user clicks "Notify banner link", then user is redirected to "start page"', async () => {
    await page.loadPage(sessionId);

    await page.clickNotifyBannerLink();

    await expect(page.page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
  });
}

export function assertLoginLink({
  page,
  sessionId,
  baseURL,
}: CommonStepsProps) {
  return test.step('when user clicks "Log in", then user is redirected to "login page"', async () => {
    await page.loadPage(sessionId);

    await page.clickLoginLink();

    await expect(page.page).toHaveURL(`${baseURL}/templates`);
  });
}

export function assertGoBackLink({
  page,
  sessionId,
  baseURL,
  expectedUrl,
}: CommonStepsProps & { expectedUrl: string }) {
  return test.step('when user clicks "Go back", then user is redirect to previous page', async () => {
    await page.loadPage(sessionId);

    await page.goBackLink.click();

    await expect(page.page).toHaveURL(`${baseURL}/${expectedUrl}`);
  });
}
