import { test, expect } from '@playwright/test';
import { TemplateMgmtPreviewPage } from '../pages/template-mgmt-preview-page';

test.describe('Placeholder preview page', () => {
  test.skip('', async ({ page }) => {
    const chooseTemplatePage = new TemplateMgmtPreviewPage(page);
    expect(chooseTemplatePage).toBe('');
  });
});
