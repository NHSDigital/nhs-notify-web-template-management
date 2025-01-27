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
  for (const { TempPage, url, pageHeading } of [
    {
      TempPage: ManageTemplatesPage,
      url: '/manage-templates',
      pageHeading: 'Manage Templates',
    },
    {
      TempPage: TemplateMgmtChoosePage,
      url: '/choose-a-template-type',
      pageHeading: 'Choose a Template Type',
    },
    {
      TempPage: TemplateMgmtCreateNhsAppPage,
      url: '/create-nhs-app-template',
      pageHeading: 'Create NHS App Message',
    },
    {
      TempPage: TemplateMgmtPreviewNhsAppPage,
      url: '/preview-nhs-app-template',
      pageHeading: 'Preview NHS App Message',
    },
    {
      TempPage: TemplateMgmtViewSubmittedNHSAppPage,
      url: '/view-submitted-nhs-app-template',
      pageHeading: 'View Submitted NHS App',
    },
    {
      TempPage: TemplateMgmtCreateSmsPage,
      url: '/create-text-message-template',
      pageHeading: 'Create SMS Template',
    },
    {
      TempPage: TemplateMgmtPreviewSmsPage,
      url: '/preview-text-message-template',
      pageHeading: 'Preview SMS Template',
    },
    {
      TempPage: TemplateMgmtViewSubmittedSMSPage,
      url: '/view-submitted-text-message-template',
      pageHeading: 'View Submitted SMS Template',
    },
    {
      TempPage: TemplateMgmtCreateEmailPage,
      url: '/create-email-template',
      pageHeading: 'Create Email Template',
    },
    {
      TempPage: TemplateMgmtPreviewEmailPage,
      url: '/preview-email-template',
      pageHeading: 'Preview Email Template',
    },
    {
      TempPage: TemplateMgmtViewSubmittedEmailPage,
      url: '/view-submitted-email-template',
      pageHeading: 'View Submitted Email Template',
    },
    {
      TempPage: TemplateMgmtCopyPage,
      url: '/copy-template',
      pageHeading: 'Copy Template',
    },
    {
      TempPage: TemplateMgmtDeletePage,
      url: '/delete-template',
      pageHeading: 'Delete Template',
    },
  ])
    test(`should not be able to access ${pageHeading} page without auth`, async ({
      page,
      baseURL,
    }) => {
      const templatePage = new TempPage(page);
      await templatePage.loadPage('');

      await expect(page).toHaveURL(
        `${baseURL}/auth?redirect=${encodeURIComponent(`/templates${url}`)}`
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
