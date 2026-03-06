import { test, expect } from '@playwright/test';
import { TemplateMgmtMessageTemplatesPage } from '../pages/template-mgmt-message-templates-page';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { TemplateMgmtChoosePrintingAndPostagePage } from 'pages/letter/template-mgmt-choose-printing-and-postage-page';
import { TemplateMgmtCopyPage } from '../pages/template-mgmt-copy-page';
import { TemplateMgmtCreateEmailPage } from '../pages/email/template-mgmt-create-email-page';
import { TemplateMgmtUploadLetterPage } from '../pages/letter/template-mgmt-upload-letter-page';
import { TemplateMgmtCreateNhsAppPage } from '../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { TemplateMgmtCreateSmsPage } from '../pages/sms/template-mgmt-create-sms-page';
import { TemplateMgmtDeletePage } from '../pages/template-mgmt-delete-page';
import { TemplateMgmtDeleteErrorPage } from 'pages/template-mgmt-delete-error-page';
import { TemplateMgmtEditEmailPage } from '../pages/email/template-mgmt-edit-email-page';
import { TemplateMgmtEditTemplateCampaignPage } from 'pages/letter/template-mgmt-edit-template-campaign-page';
import { TemplateMgmtEditTemplateNamePage } from 'pages/letter/template-mgmt-edit-template-name-page';
import { TemplateMgmtEditNhsAppPage } from '../pages/nhs-app/template-mgmt-edit-nhs-app-page';
import { TemplateMgmtEditSmsPage } from '../pages/sms/template-mgmt-edit-sms-page';
import { TemplateMgmtInvalidTemplatePage } from '../pages/template-mgmt-invalid-tempate-page';
import { TemplateMgmtPreviewEmailPage } from '../pages/email/template-mgmt-preview-email-page';
import { TemplateMgmtPreviewLetterPage } from '../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtPreviewNhsAppPage } from '../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { TemplateMgmtPreviewSmsPage } from '../pages/sms/template-mgmt-preview-sms-page';
import { TemplateMgmtPreviewSubmittedEmailPage } from '../pages/email/template-mgmt-preview-submitted-email-page';
import { TemplateMgmtPreviewSubmittedLetterPage } from '../pages/letter/template-mgmt-preview-submitted-letter-page';
import { TemplateMgmtPreviewSubmittedNhsAppPage } from '../pages/nhs-app/template-mgmt-preview-submitted-nhs-app-page';
import { TemplateMgmtPreviewSubmittedSmsPage } from '../pages/sms/template-mgmt-preview-submitted-sms-page';
import { TemplateMgmtRequestProofPage } from '../pages/template-mgmt-request-proof-page';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';
import { TemplateMgmtSubmitEmailPage } from '../pages/email/template-mgmt-submit-email-page';
import { TemplateMgmtSubmitLetterPage } from '../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtSubmitNhsAppPage } from '../pages/nhs-app/template-mgmt-submit-nhs-app-page';
import { TemplateMgmtSubmitSmsPage } from '../pages/sms/template-mgmt-submit-sms-page';
import { TemplateMgmtTemplateSubmittedEmailPage } from '../pages/email/template-mgmt-template-submitted-email-page';
import { TemplateMgmtTemplateSubmittedLetterPage } from '../pages/letter/template-mgmt-template-submitted-letter-page';
import { TemplateMgmtTemplateSubmittedNhsAppPage } from '../pages/nhs-app/template-mgmt-template-submitted-nhs-app-page';
import { TemplateMgmtTemplateSubmittedSmsPage } from '../pages/sms/template-mgmt-template-submitted-sms-page';
import { TemplateMgmtUploadLetterMissingCampaignClientIdPage } from '../pages/letter/template-mgmt-upload-letter-missing-campaign-client-id-page';
import { TemplateMgmtUploadBSLLetterTemplatePage } from 'pages/letter/template-mgmt-upload-bsl-letter-template-page';
import { TemplateMgmtUploadLargePrintLetterTemplatePage } from 'pages/letter/template-mgmt-upload-large-print-letter-template-page';
import { TemplateMgmtUploadOtherLanguageLetterTemplatePage } from 'pages/letter/template-mgmt-upload-other-language-letter-template-page';
import { TemplateMgmtUploadStandardEnglishLetterTemplatePage } from 'pages/letter/template-mgmt-upload-standard-english-letter-template-page';
import { RoutingChooseMessageOrderPage } from '../pages/routing/choose-message-order-page';
import { RoutingCreateMessagePlanPage } from '../pages/routing/create-message-plan-page';
import { RoutingMessagePlanCampaignIdRequiredPage } from '../pages/routing/campaign-id-required-page';
import { RoutingMessagePlansPage } from '../pages/routing/message-plans-page';
import { RoutingChooseTemplatesPage } from 'pages/routing/choose-templates-page';
import { RoutingEditMessagePlanSettingsPage } from 'pages/routing/edit-message-plan-settings-page';
import { RoutingInvalidMessagePlanPage } from 'pages/routing/invalid-message-plan-page';
import { RoutingChooseEmailTemplatePage } from 'pages/routing/email/choose-email-template-page';
import { RoutingChooseNhsAppTemplatePage } from 'pages/routing/nhs-app/choose-nhs-app-template-page';
import { RoutingChooseStandardLetterTemplatePage } from 'pages/routing/letter/choose-standard-letter-template-page';
import { RoutingChooseTextMessageTemplatePage } from 'pages/routing/sms/choose-sms-template-page';
import { RoutingPreviewNhsAppTemplatePage } from 'pages/routing/nhs-app/preview-nhs-app-page';
import { RoutingPreviewEmailTemplatePage } from 'pages/routing/email/preview-email-page';
import { RoutingPreviewStandardLetterTemplatePage } from 'pages/routing/letter/preview-standard-letter-page';
import { RoutingPreviewSmsTemplatePage } from 'pages/routing/sms/preview-sms-template-page';
import { RoutingChooseLargePrintLetterTemplatePage } from 'pages/routing/letter/choose-large-print-letter-template-page';
import { RoutingChooseOtherLanguageLetterTemplatePage } from 'pages/routing/letter/choose-other-language-letter-template-page';
import { RoutingPreviewLargePrintLetterTemplatePage } from 'pages/routing/letter/preview-large-print-letter-template-page';
import { RoutingPreviewOtherLanguageLetterTemplatePage } from 'pages/routing/letter/preview-other-language-letter-template-page';
import { RoutingGetReadyToMovePage } from 'pages/routing/get-ready-to-move-page';
import { RoutingPreviewMessagePlanPage } from 'pages/routing/preview-message-plan-page';
import { RoutingReviewAndMoveToProductionPage } from 'pages/routing';
import { getAppRoutes } from 'helpers/get-app-routes';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

const protectedPages = [
  RoutingChooseMessageOrderPage,
  RoutingChooseTemplatesPage,
  RoutingCreateMessagePlanPage,
  RoutingEditMessagePlanSettingsPage,
  RoutingGetReadyToMovePage,
  RoutingInvalidMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
  RoutingChooseEmailTemplatePage,
  RoutingChooseNhsAppTemplatePage,
  RoutingChooseStandardLetterTemplatePage,
  RoutingChooseLargePrintLetterTemplatePage,
  RoutingChooseOtherLanguageLetterTemplatePage,
  RoutingChooseTextMessageTemplatePage,
  RoutingPreviewMessagePlanPage,
  RoutingPreviewNhsAppTemplatePage,
  RoutingPreviewEmailTemplatePage,
  RoutingPreviewStandardLetterTemplatePage,
  RoutingPreviewLargePrintLetterTemplatePage,
  RoutingPreviewOtherLanguageLetterTemplatePage,
  RoutingPreviewSmsTemplatePage,
  RoutingReviewAndMoveToProductionPage,
  TemplateMgmtChoosePage,
  TemplateMgmtChoosePrintingAndPostagePage,
  TemplateMgmtCopyPage,
  TemplateMgmtCreateEmailPage,
  TemplateMgmtCreateNhsAppPage,
  TemplateMgmtCreateSmsPage,
  TemplateMgmtDeletePage,
  TemplateMgmtDeleteErrorPage,
  TemplateMgmtEditEmailPage,
  TemplateMgmtEditNhsAppPage,
  TemplateMgmtEditSmsPage,
  TemplateMgmtEditTemplateCampaignPage,
  TemplateMgmtEditTemplateNamePage,
  TemplateMgmtInvalidTemplatePage,
  TemplateMgmtMessageTemplatesPage,
  TemplateMgmtPreviewEmailPage,
  TemplateMgmtPreviewLetterPage,
  TemplateMgmtPreviewNhsAppPage,
  TemplateMgmtPreviewSmsPage,
  TemplateMgmtPreviewSubmittedEmailPage,
  TemplateMgmtPreviewSubmittedLetterPage,
  TemplateMgmtPreviewSubmittedNhsAppPage,
  TemplateMgmtPreviewSubmittedSmsPage,
  TemplateMgmtRequestProofPage,
  TemplateMgmtSubmitEmailPage,
  TemplateMgmtSubmitLetterPage,
  TemplateMgmtSubmitNhsAppPage,
  TemplateMgmtSubmitSmsPage,
  TemplateMgmtTemplateSubmittedEmailPage,
  TemplateMgmtTemplateSubmittedLetterPage,
  TemplateMgmtTemplateSubmittedNhsAppPage,
  TemplateMgmtTemplateSubmittedSmsPage,
  TemplateMgmtUploadLetterMissingCampaignClientIdPage,
  TemplateMgmtUploadLetterPage,
  TemplateMgmtUploadBSLLetterTemplatePage,
  TemplateMgmtUploadLargePrintLetterTemplatePage,
  TemplateMgmtUploadOtherLanguageLetterTemplatePage,
  TemplateMgmtUploadStandardEnglishLetterTemplatePage,
];

const publicPages = [TemplateMgmtStartPage];

test.describe('Protected Routes Tests', () => {
  test('all protected routes are covered', async () => {
    const routes = await getAppRoutes();

    const nonPublic = routes.filter(
      (r) =>
        !publicPages.some(
          ({ staticPathSegments }) => `${staticPathSegments.join('/')}` === r
        )
    );

    expect(nonPublic.length).toBeGreaterThan(0);

    const uncovered = nonPublic.filter(
      (r) =>
        !protectedPages.some(
          ({ staticPathSegments }) => `${staticPathSegments.join('/')}` === r
        )
    );

    expect(uncovered).toHaveLength(0);

    expect(nonPublic.length).toBe(protectedPages.length);
  });

  for (const PageModel of protectedPages)
    test(`should not be able to access ${PageModel.staticPathSegments.join('/')} page without auth`, async ({
      page,
      baseURL,
    }) => {
      const appPage = new PageModel(page);

      for (const [index, name] of PageModel.pathParameterNames.entries()) {
        appPage.setPathParam(name, `id${index}`);
      }

      await appPage.attemptToLoadPageExpectFailure();

      await expect(page).toHaveURL(
        `${baseURL}/auth?redirect=${encodeURIComponent(appPage.getUrl())}`
      );
    });
});
