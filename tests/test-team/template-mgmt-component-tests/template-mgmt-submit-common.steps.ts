import { test, expect } from '@playwright/test';
import { TemplateMgmtSubmitBasePage } from '../pages/template-mgmt-submit-base-page';

type CommonStepsProps = {
  page: TemplateMgmtSubmitBasePage;
  baseURL?: string;
};

export function assertGoBackButton({
  page,
  baseURL,
  expectedUrl,
}: CommonStepsProps & { expectedUrl: string }) {
  return test.step('when user clicks "Go back" button, then user is redirected to previous page', async () => {
    await page.loadPage();

    await page.clickGoBackButton();

    await expect(page.page).toHaveURL(`${baseURL}/${expectedUrl}`);
  });
}
