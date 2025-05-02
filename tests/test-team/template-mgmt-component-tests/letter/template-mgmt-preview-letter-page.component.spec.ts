import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtPreviewLetterPage } from '../../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtRequestProofPage } from '../../pages/template-mgmt-request-proof-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(TestUserId.User1);
  return {
    empty: {
      id: 'preview-page-invalid-letter-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: user.userId,
    } as Template,
    notYetSubmitted: TemplateFactory.createLetterTemplate(
      '9AACCD57-C6A3-4273-854C-3839A081B4D9',
      user.userId,
      'notYetSubmitted',
      'NOT_YET_SUBMITTED'
    ),
    pendingProofRequest: TemplateFactory.createLetterTemplate(
      '10AE654B-72B5-4A67-913C-2E103C7FF47B',
      user.userId,
      'pendingProofRequest',
      'PENDING_PROOF_REQUEST'
    ),
    pendingUpload: TemplateFactory.createLetterTemplate(
      '5C442DA9-B555-4CEA-AFE9-143851FD210B',
      user.userId,
      'pendingUpload',
      'PENDING_UPLOAD'
    ),
    pending: TemplateFactory.createLetterTemplate(
      'pending-letter-preview-template',
      user.userId,
      'test-pending-template-letter',
      'PENDING_UPLOAD',
      'PENDING'
    ),
    virus: TemplateFactory.createLetterTemplate(
      'virus-letter-preview-template',
      user.userId,
      'test-virus-template-letter',
      'VIRUS_SCAN_FAILED',
      'FAILED'
    ),
    invalid: TemplateFactory.createLetterTemplate(
      'invalid-letter-preview-template',
      user.userId,
      'test-invalid-template-letter',
      'VALIDATION_FAILED',
      'PASSED'
    ),
  };
}

test.describe('Preview Letter template Page', () => {
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded, can click to go to submit page', async ({
    page,
    baseURL,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

    await previewLetterTemplatePage.loadPage(templates.notYetSubmitted.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.notYetSubmitted.id}`
    );

    await expect(previewLetterTemplatePage.pageHeader).toContainText(
      templates.notYetSubmitted.name
    );

    await previewLetterTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(TemplateMgmtSubmitLetterPage.urlRegexp);
  });

  test('when template is pending a proof request, user can click to go to request page', async ({
    page,
    baseURL,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

    await previewLetterTemplatePage.loadPage(templates.pendingProofRequest.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.pendingProofRequest.id}`
    );

    await expect(previewLetterTemplatePage.pageHeader).toContainText(
      templates.pendingProofRequest.name
    );

    await previewLetterTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(TemplateMgmtRequestProofPage.urlRegexp);
  });

  test('when status is not actionable, no continue button is displayed', async ({
    page,
    baseURL,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

    await previewLetterTemplatePage.loadPage(templates.pendingUpload.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.pendingUpload.id}`
    );

    await expect(previewLetterTemplatePage.pageHeader).toContainText(
      templates.pendingUpload.name
    );

    await expect(previewLetterTemplatePage.errorSummary).toBeHidden();
    await expect(previewLetterTemplatePage.continueButton).toBeHidden();
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage(templates.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with pending files, submit is unavailable', async ({
      page,
      baseURL,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage(templates.pending.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.pending.id}`
      );

      await expect(previewLetterTemplatePage.pageHeader).toContainText(
        'test-pending-template-letter'
      );

      await expect(previewLetterTemplatePage.errorSummary).toBeHidden();
      await expect(previewLetterTemplatePage.continueButton).toBeHidden();
    });

    test('when user visits page with failed virus scan, submit is unavailable and an error is displayed', async ({
      page,
      baseURL,
    }) => {
      const errorMessage = 'The file(s) you uploaded may contain a virus.';

      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage(templates.virus.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.virus.id}`
      );

      await expect(previewLetterTemplatePage.pageHeader).toContainText(
        'test-virus-template-letter'
      );

      await expect(previewLetterTemplatePage.errorSummary).toBeVisible();
      await expect(previewLetterTemplatePage.errorSummary).toContainText(
        errorMessage
      );
      await expect(previewLetterTemplatePage.continueButton).toBeHidden();
    });

    test('when user visits page with failed validation, submit is unavailable and an error is displayed', async ({
      page,
      baseURL,
    }) => {
      const errorMessage =
        'The personalisation fields in your files are missing or do not match.';

      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage(templates.invalid.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.invalid.id}`
      );

      await expect(previewLetterTemplatePage.pageHeader).toContainText(
        'test-invalid-template-letter'
      );

      await expect(previewLetterTemplatePage.errorSummary).toBeVisible();
      await expect(previewLetterTemplatePage.errorSummary).toContainText(
        errorMessage
      );
      await expect(previewLetterTemplatePage.continueButton).toBeHidden();
    });
  });
});
