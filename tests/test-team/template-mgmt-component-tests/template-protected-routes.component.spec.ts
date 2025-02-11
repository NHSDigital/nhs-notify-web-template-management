import { test, expect } from '@playwright/test';
import { glob } from 'glob';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { ManageTemplatesPage } from '../pages/template-mgmt-manage-templates-page';
import { TemplateMgmtCreateNhsAppPage } from '../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { TemplateMgmtPreviewNhsAppPage } from '../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { TemplateMgmtViewSubmittedNhsAppPage } from '../pages/nhs-app/template-mgmt-view-submitted-nhs-app-page';
import { TemplateMgmtCreateSmsPage } from '../pages/sms/template-mgmt-create-sms-page';
import { TemplateMgmtPreviewSmsPage } from '../pages/sms/template-mgmt-preview-sms-page';
import { TemplateMgmtViewSubmittedSmsPage } from '../pages/sms/template-mgmt-view-submitted-sms-page';
import { TemplateMgmtCreateEmailPage } from '../pages/email/template-mgmt-create-email-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtViewSubmittedEmailPage } from '../pages/email/template-mgmt-view-submitted-email-page';
import { TemplateMgmtCopyPage } from '../pages/template-mgmt-copy-page';
import { TemplateMgmtDeletePage } from '../pages/template-mgmt-delete-page';
import { TemplateMgmtSubmitNhsAppPage } from '../pages/nhs-app/template-mgmt-submit-nhs-app-page';
import { TemplateMgmtSubmitEmailPage } from '../pages/email/template-mgmt-submit-email-page';
import { TemplateMgmtSubmitSmsPage } from '../pages/sms/template-mgmt-submit-sms-page';
import { TemplateMgmtTemplateSubmittedNhsAppPage } from '../pages/nhs-app/template-mgmt-template-submitted-nhs-app-page';
import { TemplateMgmtTemplateSubmittedSmsPage } from '../pages/sms/template-mgmt-template-submitted-sms-page';
import { TemplateMgmtTemplateSubmittedEmailPage } from '../pages/email/template-mgmt-template-submitted-email-page';
import { TemplateMgmtEditEmailPage } from '../pages/email/template-mgmt-edit-email-page';
import { TemplateMgmtEditNhsAppPage } from '../pages/nhs-app/template-mgmt-edit-nhs-app-page';
import { TemplateMgmtEditSmsPage } from '../pages/sms/template-mgmt-edit-sms-page';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

const protectedPages = [
  {
    PageModel: ManageTemplatesPage,
    url: '/manage-templates',
  },
  {
    PageModel: TemplateMgmtChoosePage,
    url: '/choose-a-template-type',
  },
  {
    PageModel: TemplateMgmtCreateNhsAppPage,
    url: '/create-nhs-app-template',
  },
  {
    PageModel: TemplateMgmtPreviewNhsAppPage,
    url: '/preview-nhs-app-template',
  },
  {
    PageModel: TemplateMgmtViewSubmittedNhsAppPage,
    url: '/view-submitted-nhs-app-template',
  },
  {
    PageModel: TemplateMgmtCreateSmsPage,
    url: '/create-text-message-template',
  },
  {
    PageModel: TemplateMgmtPreviewSmsPage,
    url: '/preview-text-message-template',
  },
  {
    PageModel: TemplateMgmtViewSubmittedSmsPage,
    url: '/view-submitted-text-message-template',
  },
  {
    PageModel: TemplateMgmtCreateEmailPage,
    url: '/create-email-template',
  },
  {
    PageModel: TemplateMgmtPreviewEmailPage,
    url: '/preview-email-template',
  },
  {
    PageModel: TemplateMgmtViewSubmittedEmailPage,
    url: '/view-submitted-email-template',
  },
  {
    PageModel: TemplateMgmtCopyPage,
    url: '/copy-template',
  },
  {
    PageModel: TemplateMgmtDeletePage,
    url: '/delete-template',
  },
  {
    PageModel: TemplateMgmtSubmitNhsAppPage,
    url: '/submit-nhs-app-template',
  },
  {
    PageModel: TemplateMgmtSubmitEmailPage,
    url: '/submit-email-template',
  },
  {
    PageModel: TemplateMgmtSubmitSmsPage,
    url: '/submit-text-message-template',
  },
  {
    PageModel: TemplateMgmtSubmitSmsPage,
    url: '/invalid-template',
  },
  {
    PageModel: TemplateMgmtTemplateSubmittedNhsAppPage,
    url: '/nhs-app-template-submitted',
  },
  {
    PageModel: TemplateMgmtTemplateSubmittedSmsPage,
    url: '/text-message-template-submitted',
  },
  {
    PageModel: TemplateMgmtTemplateSubmittedEmailPage,
    url: '/email-template-submitted',
  },
  {
    PageModel: TemplateMgmtEditNhsAppPage,
    url: '/edit-nhs-app-template',
  },
  {
    PageModel: TemplateMgmtEditSmsPage,
    url: '/edit-text-message-template',
  },
  {
    PageModel: TemplateMgmtEditEmailPage,
    url: '/edit-email-template',
  },
];

const publicRoutes = new Set(['create-and-submit-templates']);

test.describe('Protected Routes Tests', () => {
  test('all protected routes are covered', async () => {
    const pageTsxPaths = await glob('../../frontend/src/app/**/page.tsx');

    const routes = pageTsxPaths.map((p) => {
      const dynamicStripped = p.replaceAll(/\/\[[^[]+]/g, '');

      // eslint-disable-next-line sonarjs/slow-regex
      const [, route] = dynamicStripped.match(/([^/]+)\/page.tsx$/) ?? [];

      if (!route) {
        throw new Error('failed to parse route');
      }

      return route;
    });

    const nonPublic = routes.filter((r) => !publicRoutes.has(r));

    expect(nonPublic.length).toBeGreaterThan(0);

    const uncovered = nonPublic.filter(
      (r) => !protectedPages.some(({ url }) => url.slice(1) === r)
    );

    expect(uncovered).toHaveLength(0);

    expect(nonPublic.length).toBe(protectedPages.length);
  });

  for (const { PageModel, url } of protectedPages)
    test(`should not be able to access ${url} page without auth`, async ({
      page,
      baseURL,
    }) => {
      const templatePage = new PageModel(page);
      await templatePage.loadPage('');

      const redirectPath = encodeURIComponent(`/templates${url}`);

      await expect(page).toHaveURL(`${baseURL}/auth?redirect=${redirectPath}`);
    });
});
