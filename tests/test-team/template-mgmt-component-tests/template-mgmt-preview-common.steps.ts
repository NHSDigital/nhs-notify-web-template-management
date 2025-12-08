import { test, expect } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../pages/template-mgmt-preview-base-page';

type PreviewStepsProps = {
  page: TemplateMgmtPreviewBasePage;
  baseURL?: string;
};

export function assertBackToAllTemplatesTopLink({
  page,

  baseURL,
}: PreviewStepsProps) {
  return test.step('when user clicks the top "Back to all templates" link, then user is redirected to manage templates page', async () => {
    await page.loadPage();

    await page.clickBackLinkTop();

    await expect(page.page).toHaveURL(`${baseURL}/templates/message-templates`);
  });
}

export function assertBackToAllTemplatesBottomLink({
  page,

  baseURL,
}: PreviewStepsProps) {
  return test.step('when user clicks the bottom "Back to all templates" link, then user is redirected to manage templates page', async () => {
    await page.loadPage();

    await page.backLinkBottom.click();

    await expect(page.page).toHaveURL(`${baseURL}/templates/message-templates`);
  });
}
