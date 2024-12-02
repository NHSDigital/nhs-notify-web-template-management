import { test, expect } from '@playwright/test';
import { TemplateMgmtSubmitPage } from '../pages/template-mgmt-submit-page';

type CommonStepsProps = {
  page: TemplateMgmtSubmitPage;
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

    await page.clickGoBackButton();

    await expect(page.page).toHaveURL(`${baseURL}/${expectedUrl}`);
  });
}
