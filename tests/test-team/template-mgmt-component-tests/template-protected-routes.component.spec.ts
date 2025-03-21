import { test, expect } from '@playwright/test';
import { glob } from 'glob';
import { execSync } from 'node:child_process';
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
import { TemplateMgmtInvalidTemplatePage } from '../pages/template-mgmt-invalid-tempate-page';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';
import { TemplateMgmtBasePageDynamic } from '../pages/template-mgmt-base-page-dynamic';
import { TemplateMgmtCreateLetterPage } from '../pages/letter/template-mgmt-create-letter-page';
import { TemplateMgmtPreviewLetterPage } from '../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtTemplateSubmittedLetterPage } from '../pages/letter/temnplate-mgmt-template-submitted-letter-page';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

const protectedPages = [
  ManageTemplatesPage,
  TemplateMgmtChoosePage,
  TemplateMgmtCopyPage,
  TemplateMgmtCreateEmailPage,
  TemplateMgmtCreateLetterPage,
  TemplateMgmtCreateNhsAppPage,
  TemplateMgmtCreateSmsPage,
  TemplateMgmtDeletePage,
  TemplateMgmtEditEmailPage,
  TemplateMgmtEditNhsAppPage,
  TemplateMgmtEditSmsPage,
  TemplateMgmtInvalidTemplatePage,
  TemplateMgmtPreviewEmailPage,
  TemplateMgmtPreviewLetterPage,
  TemplateMgmtPreviewNhsAppPage,
  TemplateMgmtPreviewSmsPage,
  TemplateMgmtSubmitEmailPage,
  TemplateMgmtSubmitNhsAppPage,
  TemplateMgmtSubmitSmsPage,
  TemplateMgmtSubmitLetterPage,
  TemplateMgmtTemplateSubmittedEmailPage,
  TemplateMgmtTemplateSubmittedNhsAppPage,
  TemplateMgmtTemplateSubmittedSmsPage,
  TemplateMgmtTemplateSubmittedLetterPage,
  TemplateMgmtViewSubmittedEmailPage,
  TemplateMgmtViewSubmittedNhsAppPage,
  TemplateMgmtViewSubmittedSmsPage,
];

const publicPages = [TemplateMgmtStartPage];

test.describe('Protected Routes Tests', () => {
  test('all protected routes are covered', async () => {
    const projectRoot = execSync('/usr/bin/git rev-parse --show-toplevel', {
      encoding: 'utf8',
    }).trim();

    const pageTsxPaths = await glob(
      `${projectRoot}/frontend/src/app/**/page.tsx`
    );

    const routes = pageTsxPaths.map((p) => {
      const dynamicStripped = p.replaceAll(/\/\[[^[]+]/g, '');

      // eslint-disable-next-line sonarjs/slow-regex
      const [, route] = dynamicStripped.match(/([^/]+)\/page.tsx$/) ?? [];

      if (!route) {
        throw new Error('failed to parse route');
      }

      return route;
    });

    const nonPublic = routes.filter(
      (r) => !publicPages.some(({ pageUrlSegment }) => pageUrlSegment === r)
    );

    expect(nonPublic.length).toBeGreaterThan(0);

    const uncovered = nonPublic.filter(
      (r) => !protectedPages.some(({ pageUrlSegment }) => pageUrlSegment === r)
    );

    expect(uncovered).toHaveLength(0);

    expect(nonPublic.length).toBe(protectedPages.length);
  });

  for (const PageModel of protectedPages)
    test(`should not be able to access ${PageModel.pageUrlSegment} page without auth`, async ({
      page,
      baseURL,
    }) => {
      const appPage = new PageModel(page);
      const isDynamic = appPage instanceof TemplateMgmtBasePageDynamic;

      await (isDynamic ? appPage.loadPage('template-id') : appPage.loadPage());

      const redirectPath = encodeURIComponent(
        isDynamic
          ? `/${PageModel.appUrlSegment}/${PageModel.pageUrlSegment}/template-id`
          : `/${PageModel.appUrlSegment}/${PageModel.pageUrlSegment}`
      );

      await expect(page).toHaveURL(`${baseURL}/auth?redirect=${redirectPath}`);
    });
});
