import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { glob } from 'glob';
import { getAppRoutes } from 'helpers/get-app-routes';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';

// General template pages
import { TemplateMgmtStartPage } from 'pages/template-mgmt-start-page';
import { TemplateMgmtMessageTemplatesPage } from 'pages/template-mgmt-message-templates-page';
import { TemplateMgmtChoosePage } from 'pages/template-mgmt-choose-page';
import { TemplateMgmtCopyPage } from 'pages/template-mgmt-copy-page';
import { TemplateMgmtDeletePage } from 'pages/template-mgmt-delete-page';
import { TemplateMgmtDeleteErrorPage } from 'pages/template-mgmt-delete-error-page';
import { TemplateMgmtInvalidTemplatePage } from 'pages/template-mgmt-invalid-tempate-page';

// Email template pages
import {
  TemplateMgmtCreateEmailPage,
  TemplateMgmtEditEmailPage,
  TemplateMgmtPreviewEmailPage,
  TemplateMgmtPreviewSubmittedEmailPage,
  TemplateMgmtSubmitEmailPage,
  TemplateMgmtTemplateSubmittedEmailPage,
} from 'pages/email';

// SMS template pages
import {
  TemplateMgmtCreateSmsPage,
  TemplateMgmtEditSmsPage,
  TemplateMgmtPreviewSmsPage,
  TemplateMgmtPreviewSubmittedSmsPage,
  TemplateMgmtSubmitSmsPage,
  TemplateMgmtTemplateSubmittedSmsPage,
} from 'pages/sms';

// NHS App template pages
import {
  TemplateMgmtCreateNhsAppPage,
  TemplateMgmtEditNhsAppPage,
  TemplateMgmtPreviewNhsAppPage,
  TemplateMgmtPreviewSubmittedNhsAppPage,
  TemplateMgmtSubmitNhsAppPage,
  TemplateMgmtTemplateSubmittedNhsAppPage,
} from 'pages/nhs-app';

// Letter template pages
import {
  TemplateMgmtEditTemplateCampaignPage,
  TemplateMgmtEditTemplateNamePage,
  TemplateMgmtPreviewLetterPage,
  TemplateMgmtPreviewSubmittedLetterPage,
  TemplateMgmtSubmitLetterPage,
  TemplateMgmtTemplateSubmittedLetterPage,
  TemplateMgmtUploadBSLLetterTemplatePage,
  TemplateMgmtUploadLargePrintLetterTemplatePage,
  TemplateMgmtUploadLetterMissingCampaignClientIdPage,
  TemplateMgmtUploadLetterPage,
  TemplateMgmtUploadOtherLanguageLetterTemplatePage,
  TemplateMgmtUploadStandardEnglishLetterTemplatePage,
} from 'pages/letter';
import { TemplateMgmtRequestProofPage } from 'pages/template-mgmt-request-proof-page';

// Routing (message plan) pages
import {
  RoutingChooseEmailTemplatePage,
  RoutingChooseLargePrintLetterTemplatePage,
  RoutingChooseMessageOrderPage,
  RoutingChooseNhsAppTemplatePage,
  RoutingChooseOtherLanguageLetterTemplatePage,
  RoutingChooseStandardLetterTemplatePage,
  RoutingChooseTemplatesPage,
  RoutingChooseTextMessageTemplatePage,
  RoutingCreateMessagePlanPage,
  RoutingEditMessagePlanSettingsPage,
  RoutingGetReadyToMovePage,
  RoutingInvalidMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
  RoutingPreviewEmailTemplatePage,
  RoutingPreviewLargePrintLetterTemplatePage,
  RoutingPreviewMessagePlanPage,
  RoutingPreviewNhsAppTemplatePage,
  RoutingPreviewOtherLanguageLetterTemplatePage,
  RoutingPreviewSmsTemplatePage,
  RoutingPreviewStandardLetterTemplatePage,
  RoutingReviewAndMoveToProductionPage,
} from 'pages/routing';

/**
 * All page objects that must have accessibility test coverage.
 *
 * When a new page is added to the frontend app, add its corresponding page
 * object here. The test below will fail until a page object covering the
 * new route is registered and corresponding accessibility test added.
 */
const allPages: (typeof TemplateMgmtBasePage)[] = [
  // General
  TemplateMgmtStartPage,
  TemplateMgmtMessageTemplatesPage,
  TemplateMgmtChoosePage,
  TemplateMgmtCopyPage,
  TemplateMgmtDeletePage,
  TemplateMgmtDeleteErrorPage,
  TemplateMgmtInvalidTemplatePage,

  // Email
  TemplateMgmtCreateEmailPage,
  TemplateMgmtEditEmailPage,
  TemplateMgmtPreviewEmailPage,
  TemplateMgmtPreviewSubmittedEmailPage,
  TemplateMgmtSubmitEmailPage,
  TemplateMgmtTemplateSubmittedEmailPage,

  // SMS
  TemplateMgmtCreateSmsPage,
  TemplateMgmtEditSmsPage,
  TemplateMgmtPreviewSmsPage,
  TemplateMgmtPreviewSubmittedSmsPage,
  TemplateMgmtSubmitSmsPage,
  TemplateMgmtTemplateSubmittedSmsPage,

  // NHS App
  TemplateMgmtCreateNhsAppPage,
  TemplateMgmtEditNhsAppPage,
  TemplateMgmtPreviewNhsAppPage,
  TemplateMgmtPreviewSubmittedNhsAppPage,
  TemplateMgmtSubmitNhsAppPage,
  TemplateMgmtTemplateSubmittedNhsAppPage,

  // Letter
  TemplateMgmtUploadLetterPage,
  TemplateMgmtUploadStandardEnglishLetterTemplatePage,
  TemplateMgmtUploadLargePrintLetterTemplatePage,
  TemplateMgmtUploadBSLLetterTemplatePage,
  TemplateMgmtUploadOtherLanguageLetterTemplatePage,
  TemplateMgmtUploadLetterMissingCampaignClientIdPage,
  TemplateMgmtEditTemplateNamePage,
  TemplateMgmtEditTemplateCampaignPage,
  TemplateMgmtPreviewLetterPage,
  TemplateMgmtPreviewSubmittedLetterPage,
  TemplateMgmtSubmitLetterPage,
  TemplateMgmtTemplateSubmittedLetterPage,
  TemplateMgmtRequestProofPage,

  // Routing / Message plans
  RoutingMessagePlansPage,
  RoutingCreateMessagePlanPage,
  RoutingChooseMessageOrderPage,
  RoutingChooseTemplatesPage,
  RoutingChooseEmailTemplatePage,
  RoutingChooseLargePrintLetterTemplatePage,
  RoutingChooseNhsAppTemplatePage,
  RoutingChooseOtherLanguageLetterTemplatePage,
  RoutingChooseStandardLetterTemplatePage,
  RoutingChooseTextMessageTemplatePage,
  RoutingEditMessagePlanSettingsPage,
  RoutingGetReadyToMovePage,
  RoutingInvalidMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingPreviewEmailTemplatePage,
  RoutingPreviewLargePrintLetterTemplatePage,
  RoutingPreviewMessagePlanPage,
  RoutingPreviewNhsAppTemplatePage,
  RoutingPreviewOtherLanguageLetterTemplatePage,
  RoutingPreviewSmsTemplatePage,
  RoutingPreviewStandardLetterTemplatePage,
  RoutingReviewAndMoveToProductionPage,
];

test('all app routes have accessibility test coverage', async () => {
  const routes = await getAppRoutes();

  const pageRoutes = allPages.map((page) => page.staticPathSegments.join('/'));

  const uncoveredRoutes = routes.filter((route) => !pageRoutes.includes(route));

  const orphanedPages = pageRoutes.filter(
    (pageRoute) => !routes.includes(pageRoute)
  );

  expect(
    uncoveredRoutes,
    `The following app routes have no accessibility test coverage. ` +
      `Add a page object and include it in the allPages array:\n` +
      uncoveredRoutes.map((r) => `  - ${r}`).join('\n')
  ).toHaveLength(0);

  expect(
    orphanedPages,
    `The following page objects do not match any app route. ` +
      `Remove or update them:\n` +
      orphanedPages.map((r) => `  - ${r}`).join('\n')
  ).toHaveLength(0);

  expect(routes).toHaveLength(allPages.length);
});

test('all page objects are used in accessibility spec files', async () => {
  const specFiles = await glob(`${__dirname}/*.accessibility.spec.ts`);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const specContents = specFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

  const untestedPages = allPages.filter(
    (page) => !specContents.includes(`new ${page.name}(`)
  );

  expect(
    untestedPages.map((p) => p.name),
    `The following page objects are registered in allPages but are never ` +
      `instantiated in any .accessibility.spec.ts file. ` +
      `Write an accessibility test for each one:\n` +
      untestedPages.map((p) => `  - ${p.name}`).join('\n')
  ).toHaveLength(0);
});
