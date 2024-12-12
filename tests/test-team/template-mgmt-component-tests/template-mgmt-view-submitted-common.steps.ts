import { test, expect } from '@playwright/test';
import { TemplateMgmtViewSubmitedPage } from '../pages/template-mgmt-view-submitted-page';

type PreviewStepsProps = {
  page: TemplateMgmtViewSubmitedPage;
  id: string;
  baseURL?: string;
};

export function assertBackToAllTemplatesTopLink({
  page,
  id,
  baseURL,
}: PreviewStepsProps) {
  return test.step('when user clicks the top "Back to all templates" link, then user is redirected to manage templates page', async () => {
    await page.loadPage(id);

    await page.clickBackToAllTemplatesTopLink();

    await expect(page.page).toHaveURL(`${baseURL}/templates/manage-templates`);
  });
}

export function assertBackToAllTemplatesBottomLink({
  page,
  id,
  baseURL,
}: PreviewStepsProps) {
  return test.step('when user clicks the bottom "Back to all templates" link, then user is redirected to manage templates page', async () => {
    await page.loadPage(id);

    await page.clickBackToAllTemplatesTopLink();

    await expect(page.page).toHaveURL(`${baseURL}/templates/manage-templates`);
  });
}