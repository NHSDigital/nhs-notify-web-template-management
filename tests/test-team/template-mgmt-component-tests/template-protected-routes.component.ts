import { test, expect } from '@playwright/test';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { ManageTemplatesPage } from '../pages/template-mgmt-manage-templates-page';
import { TemplateMgmtCreateNhsAppPage } from '../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { TemplateMgmtPreviewNhsAppPage } from '../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { TemplateMgmtViewSubmittedNHSAppPage } from '../pages/nhs-app/template-mgmt-view-submitted-nhs-app-page';
import { TemplateMgmtCreateSmsPage } from '../pages/sms/template-mgmt-create-sms-page';
import { TemplateMgmtPreviewSmsPage } from '../pages/sms/template-mgmt-preview-sms-page';
import { TemplateMgmtViewSubmittedSMSPage } from '../pages/sms/template-mgmt-view-submitted-sms-page';
import { TemplateMgmtCreateEmailPage } from '../pages/email/template-mgmt-create-email-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtViewSubmittedEmailPage } from '../pages/email/template-mgmt-view-submitted-email-page';
import { TemplateMgmtCopyPage } from '../pages/template-mgmt-copy-page';
import { TemplateMgmtDeletePage } from '../pages/template-mgmt-delete-page';
import { TemplateMgmtSubmitPage } from '../pages/template-mgmt-submit-page';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Protected Routes Tests', () => {
  test('should not be able to access "Manage Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new ManageTemplatesPage(page);

    await chooseTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/manage-templates')}`
    );
  });

  test('should not be able to access "Choose Template Type" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/choose-a-template-type')}`
    );
  });

  // NHS App Template
  test('should not be able to access "Create NHS App Message" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/create-nhs-app-template')}`
    );
  });

  test('should not be able to access "Preview NHS App Message" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/preview-nhs-app-template')}`
    );
  });

  test('should not be able to access "View Submitted NHS App" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtViewSubmittedNHSAppPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/view-submitted-nhs-app-template')}`
    );
  });

  // NHS SMS Template
  test('should not be able to access "Create SMS Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtCreateSmsPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/create-text-message-template')}`
    );
  });

  test('should not be able to access "Preview SMS Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtPreviewSmsPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/preview-text-message-template')}`
    );
  });

  test('should not be able to access "View Submitted SMS Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtViewSubmittedSMSPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/view-submitted-text-message-template')}`
    );
  });

  // NHS Email Template
  test('should not be able to access "Create Email Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/create-email-template')}`
    );
  });

  test('should not be able to access "Preview Email Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtPreviewEmailPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/preview-email-template')}`
    );
  });

  test('should not be able to access "View Submitted Email Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtViewSubmittedEmailPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/view-submitted-email-template')}`
    );
  });

  // Copy Template
  test('should not be able to access "Copy Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtCopyPage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/copy-template')}`
    );
  });

  // Delete Template
  test('should not be able to access "Delete Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtDeletePage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/delete-template')}`
    );
  });

  // Submit Template
  test('should not be able to access "Submitted Template" page without auth', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtSubmitPage(page, 'nhs-app');

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=${encodeURIComponent('/templates/submit-nhs-app-template')}`
    );
  });
});
