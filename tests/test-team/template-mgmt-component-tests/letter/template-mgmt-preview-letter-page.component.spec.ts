import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtPreviewLetterPage } from '../../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtRequestProofPage } from '../../pages/template-mgmt-request-proof-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

  const withProofsBase = TemplateFactory.uploadLetterTemplate(
    'C8814A1D-1F3A-4AE4-9FE3-BDDA76EADF0C',
    user,
    'proofs-template-letter',
    'PROOF_AVAILABLE',
    'PASSED'
  );

  const withProofs: Template = {
    ...withProofsBase,
    files: {
      ...withProofsBase.files,
      proofs: {
        'a.pdf': {
          virusScanStatus: 'FAILED',
          supplier: 'WTMMOCK',
          fileName: 'a.pdf',
        },
        'b.pdf': {
          virusScanStatus: 'PASSED',
          supplier: 'WTMMOCK',
          fileName: 'b.pdf',
        },
      },
    },
  };

  return {
    empty: {
      id: 'preview-page-invalid-letter-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
    } as Template,
    notYetSubmitted: TemplateFactory.uploadLetterTemplate(
      '9AACCD57-C6A3-4273-854C-3839A081B4D9',
      user,
      'notYetSubmitted',
      'NOT_YET_SUBMITTED'
    ),
    pendingProofRequest: TemplateFactory.uploadLetterTemplate(
      '10AE654B-72B5-4A67-913C-2E103C7FF47B',
      user,
      'pendingProofRequest',
      'PENDING_PROOF_REQUEST'
    ),
    pendingUpload: TemplateFactory.uploadLetterTemplate(
      '5C442DA9-B555-4CEA-AFE9-143851FD210B',
      user,
      'pendingUpload',
      'PENDING_UPLOAD'
    ),
    pending: TemplateFactory.uploadLetterTemplate(
      '7110530b-3565-4d4d-b2d7-56a319d55fde',
      user,
      'test-pending-template-letter',
      'PENDING_UPLOAD',
      'PENDING'
    ),
    virus: TemplateFactory.uploadLetterTemplate(
      'd2d32123-0a60-4333-bbde-d22e5d5ef6d9',
      user,
      'test-virus-template-letter',
      'VIRUS_SCAN_FAILED',
      'FAILED'
    ),
    invalid: TemplateFactory.uploadLetterTemplate(
      'b6cace12-556a-4e84-ab79-768d82539b6f',
      user,
      'test-invalid-template-letter',
      'VALIDATION_FAILED',
      'PASSED'
    ),
    proofingDisabled: {
      ...TemplateFactory.uploadLetterTemplate(
        '9AACCD57-C6A3-4273-854C-3839A081B4D8',
        user,
        'ProofingDisabled',
        'NOT_YET_SUBMITTED'
      ),
      proofingEnabled: false,
    },
    withProofs,
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

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.notYetSubmitted.name
    );

    if (!templates.notYetSubmitted.campaignId) {
      throw new Error('Test data misconfiguration');
    }

    await expect(previewLetterTemplatePage.campaignId).toContainText(
      templates.notYetSubmitted.campaignId
    );

    await previewLetterTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      TemplateMgmtSubmitLetterPage.url(
        templates.notYetSubmitted.id,
        templates.notYetSubmitted.lockNumber
      )
    );
  });

  test('when proofingEnabled is false, user can click to go submit page', async ({
    page,
    baseURL,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

    await previewLetterTemplatePage.loadPage(templates.proofingDisabled.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.proofingDisabled.id}`
    );

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.proofingDisabled.name
    );

    await previewLetterTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      TemplateMgmtSubmitLetterPage.url(
        templates.proofingDisabled.id,
        templates.proofingDisabled.lockNumber
      )
    );
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

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.pendingProofRequest.name
    );

    await previewLetterTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      TemplateMgmtRequestProofPage.url(
        templates.pendingProofRequest.id,
        templates.pendingProofRequest.lockNumber
      )
    );
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

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
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

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
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

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
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

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
        'test-invalid-template-letter'
      );

      await expect(previewLetterTemplatePage.errorSummary).toBeVisible();
      await expect(previewLetterTemplatePage.errorSummary).toContainText(
        errorMessage
      );
      await expect(previewLetterTemplatePage.continueButton).toBeHidden();
    });

    test('when the template has proofs, only those passing the virus scan are displayed', async ({
      page,
      baseURL,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await previewLetterTemplatePage.loadPage(templates.withProofs.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/${TemplateMgmtPreviewLetterPage.pageUrlSegment}/${templates.withProofs.id}`
      );

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
        templates.withProofs.name
      );

      await expect(previewLetterTemplatePage.pdfLinks).toHaveCount(1);

      const pdfLink = previewLetterTemplatePage.pdfLinks.first();

      await expect(pdfLink).toHaveText('b.pdf');
      await expect(pdfLink).toHaveAttribute(
        'href',
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(
          `^/templates/files/[^/]+/proofs/${templates.withProofs.id}/b.pdf$`
        )
      );
    });
  });
});
