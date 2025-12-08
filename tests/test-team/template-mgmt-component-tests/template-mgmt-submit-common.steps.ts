import { test, expect } from '@playwright/test';
import { TemplateMgmtSubmitBasePage } from '../pages/template-mgmt-submit-base-page';

type CommonStepsProps = {
  page: TemplateMgmtSubmitBasePage;
  id: string;
  baseURL?: string;
};

export function assertGoBackButton({
  page,
  id,
  baseURL,
  expectedUrl,
}: CommonStepsProps & { expectedUrl: string }) {
  return test.step('when user clicks "Go back" button, then user is redirected to previous page', async () => {
    await page.loadPage(id);

    await page.backLinkBottom.click();

    await expect(page.page).toHaveURL(`${baseURL}/${expectedUrl}`);
  });
}
