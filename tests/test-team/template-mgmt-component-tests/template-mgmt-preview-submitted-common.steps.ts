import { test, expect } from '@playwright/test';
import { TemplateMgmtPreviewSubmitedBasePage } from '../pages/template-mgmt-preview-submitted-base-page';

type PreviewStepsProps = {
  page: TemplateMgmtPreviewSubmitedBasePage;
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

    await expect(page.page).toHaveURL(`${baseURL}/templates/message-templates`);
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

    await expect(page.page).toHaveURL(`${baseURL}/templates/message-templates`);
  });
}
